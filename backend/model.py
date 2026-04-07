import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random

random.seed(42)
np.random.seed(42)

CATEGORIES = ['Plumbers', 'Electricians', 'Hospitals', 'Grocery', 'Courier']
AREAS = [
    'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai',
    'Kolkata', 'Hyderabad', 'Ahmedabad', 'Jaipur', 'Lucknow',
    'Surat', 'Nagpur', 'Indore', 'Bhopal', 'Patna',
    'Vadodara', 'Coimbatore', 'Visakhapatnam', 'Kochi', 'Chandigarh'
]

# ─── Synthetic Data Generation ───────────────────────────────────────────────

def generate_requests_df():
    rows = []
    base = datetime(2024, 1, 1)
    for i in range(10000):
        date = base + timedelta(days=random.randint(0, 364))
        area = random.choices(AREAS, weights=[20,18,15,14,10,9,8,6,7,6,5,5,4,4,3,4,3,3,3,3])[0]
        category = random.choices(CATEGORIES, weights=[25,28,18,15,14])[0]
        price = {
            'Plumbers': random.randint(300, 1200),
            'Electricians': random.randint(400, 1500),
            'Hospitals': random.randint(500, 5000),
            'Grocery': random.randint(100, 800),
            'Courier': random.randint(80, 500),
        }[category]
        rows.append({'date': date, 'area': area, 'category': category, 'price': price})
    return pd.DataFrame(rows)


def generate_providers_df():
    rows = []
    for area in AREAS:
        for cat in CATEGORIES:
            count = random.randint(50, 200)
            for _ in range(count):
                rows.append({
                    'area': area,
                    'category': cat,
                    'rating': round(random.uniform(3.0, 5.0), 1),
                    'completed_services': random.randint(5, 300),
                    'response_time_hrs': round(random.uniform(0.5, 24.0), 1),
                })
    return pd.DataFrame(rows)


requests_df = generate_requests_df()
providers_df = generate_providers_df()


# ─── 1. Demand Trends ────────────────────────────────────────────────────────

def get_demand_trends(area=None, category=None):
    df = requests_df.copy()
    if area and area != 'All' and area != 'All India':
        df = df[df['area'] == area]
    if category and category != 'All':
        df = df[df['category'] == category]
    df['month'] = df['date'].dt.strftime('%b')
    df['month_num'] = df['date'].dt.month
    grouped = df.groupby(['month_num', 'month']).size().reset_index(name='demand')
    grouped = grouped.sort_values('month_num')

    prov = providers_df.copy()
    if area and area != 'All' and area != 'All India':
        prov = prov[prov['area'] == area]
    if category and category != 'All':
        prov = prov[prov['category'] == category]
    supply_count = len(prov)

    result = []
    for _, row in grouped.iterrows():
        result.append({
            'name': row['month'],
            'demand': int(row['demand']),
            'supply': max(1, supply_count + random.randint(-2, 2))
        })
    return result


# ─── 2. Category Popularity ──────────────────────────────────────────────────

def get_category_popularity(area=None):
    df = requests_df.copy()
    if area and area != 'All':
        df = df[df['area'] == area]
    counts = df['category'].value_counts()
    total = counts.sum()
    return [{'name': cat, 'value': int(counts.get(cat, 0)), 'percent': round(counts.get(cat, 0) / total * 100, 1)} for cat in CATEGORIES]


# ─── 3. Area-wise Demand ─────────────────────────────────────────────────────

def get_area_demand(category=None):
    df = requests_df.copy()
    if category and category != 'All':
        df = df[df['category'] == category]
    pivot = df.groupby(['area', 'category']).size().unstack(fill_value=0).reset_index()
    result = []
    for _, row in pivot.iterrows():
        entry = {'area': row['area']}
        for cat in CATEGORIES:
            entry[cat] = int(row.get(cat, 0))
        result.append(entry)
    return result


# ─── 4. Service Gap Detection ────────────────────────────────────────────────

def get_service_gaps():
    demand = requests_df.groupby(['area', 'category']).size().reset_index(name='demand_count')
    supply = providers_df.groupby(['area', 'category']).size().reset_index(name='supply_count')
    merged = pd.merge(demand, supply, on=['area', 'category'], how='left').fillna(0)

    # Normalize demand per category so no single category dominates
    merged['demand_norm'] = merged.groupby('category')['demand_count'].transform(
        lambda x: (x - x.min()) / (x.max() - x.min() + 1e-9)
    )
    merged['supply_norm'] = merged.groupby('category')['supply_count'].transform(
        lambda x: (x - x.min()) / (x.max() - x.min() + 1e-9)
    )
    merged['gap_score'] = (merged['demand_norm'] - merged['supply_norm']) * 100

    # Show ALL gaps not just positive normalized ones
    gaps = merged.copy()
    gaps['raw_gap'] = gaps['demand_count'] - (gaps['supply_count'] * 0.1)
    gaps = gaps[gaps['raw_gap'] > 0].copy()
    # Pick the single worst gap per area (highest gap_score)
    top_per_area = gaps.loc[gaps.groupby('area')['gap_score'].idxmax()].reset_index(drop=True)
    # Also include remaining gaps sorted by score
    all_gaps = gaps.sort_values('gap_score', ascending=False)

    result = []
    seen_area_cat = set()
    # First add the top gap per area to ensure variety
    for _, row in top_per_area.iterrows():
        key = (row['area'], row['category'])
        seen_area_cat.add(key)
        result.append({
            'area': row['area'],
            'category': row['category'],
            'demand': int(row['demand_count']),
            'supply': int(row['supply_count']),
            'gap_score': round(float(row['gap_score']), 1),
            'opportunity': 'High Opportunity' if row['gap_score'] > 50 else 'Moderate Opportunity'
        })
    # Then fill in remaining unique area+category combos
    for _, row in all_gaps.iterrows():
        key = (row['area'], row['category'])
        if key not in seen_area_cat:
            seen_area_cat.add(key)
            result.append({
                'area': row['area'],
                'category': row['category'],
                'demand': int(row['demand_count']),
                'supply': int(row['supply_count']),
                'gap_score': round(float(row['gap_score']), 1),
                'opportunity': 'High Opportunity' if row['gap_score'] > 50 else 'Moderate Opportunity'
            })
    return result


# ─── 5. Business Recommendations ─────────────────────────────────────────────

def get_business_recommendations():
    gaps = get_service_gaps()
    area_recs = {}
    for gap in gaps:
        area = gap['area']
        if area not in area_recs:
            area_recs[area] = []
        if len(area_recs[area]) < 3:
            area_recs[area].append({
                'title': f"Start {gap['category']} service in {area}",
                'description': f"High demand ({gap['demand']} requests) with only {gap['supply']} providers. {gap['opportunity']}.",
                'area': area,
                'category': gap['category'],
                'opportunity': gap['opportunity'],
                'gap_score': gap['gap_score'],
            })
    return area_recs


# ─── 6. Price Analytics ──────────────────────────────────────────────────────

def get_price_analytics(area=None):
    df = requests_df.copy()
    if area and area != 'All':
        df = df[df['area'] == area]
    result = []
    for cat in CATEGORIES:
        cat_df = df[df['category'] == cat]['price']
        if cat_df.empty:
            continue
        mean = cat_df.mean()
        std = cat_df.std()
        q1 = cat_df.quantile(0.25)
        q3 = cat_df.quantile(0.75)
        outliers_high = int((cat_df > mean + 2 * std).sum())
        outliers_low = int((cat_df < mean - 2 * std).sum())
        result.append({
            'category': cat,
            'avg_price': round(mean, 0),
            'min_price': int(cat_df.min()),
            'max_price': int(cat_df.max()),
            'q1': round(q1, 0),
            'q3': round(q3, 0),
            'overpriced_count': outliers_high,
            'underpriced_count': outliers_low,
        })
    return result


# ─── 7. Predictive Analytics ─────────────────────────────────────────────────

def get_predictions(area=None):
    df = requests_df.copy()
    if area and area != 'All':
        df = df[df['area'] == area]
    df['month_num'] = df['date'].dt.month
    result = []
    for cat in CATEGORIES:
        cat_df = df[df['category'] == cat].groupby('month_num').size().reset_index(name='count')
        if len(cat_df) < 2:
            continue
        x = cat_df['month_num'].values
        y = cat_df['count'].values
        coeffs = np.polyfit(x, y, 1)
        next_month = x[-1] + 1 if x[-1] < 12 else 1
        predicted = max(0, round(float(np.polyval(coeffs, next_month))))
        trend = 'rising' if coeffs[0] > 0 else 'falling'
        pct = round(abs(coeffs[0]) / (y.mean() + 1e-9) * 100, 1)
        text = f"Demand for {cat} expected to {'rise' if trend == 'rising' else 'fall'} by ~{pct}% next month"
        result.append({
            'category': cat,
            'current_avg': round(float(y.mean()), 1),
            'predicted_next': predicted,
            'trend': trend,
            'trend_pct': pct,
            'insight': text,
            'text': text,
        })
    return result


# ─── 8. Booming Services ─────────────────────────────────────────────────────

def get_booming_services(area=None):
    df = requests_df.copy()
    if area and area != 'All':
        df = df[df['area'] == area]
    df['month_num'] = df['date'].dt.month
    result = []
    for cat in CATEGORIES:
        cat_df = df[df['category'] == cat].groupby('month_num').size().reset_index(name='count')
        if len(cat_df) < 2:
            continue
        x = cat_df['month_num'].values
        y = cat_df['count'].values
        coeffs = np.polyfit(x, y, 1)
        growth = round(coeffs[0] / (y.mean() + 1e-9) * 100, 1)
        if growth > 0:
            result.append({'category': cat, 'growth': growth})
    result.sort(key=lambda x: x['growth'], reverse=True)
    return result


# ─── 9. Area Insights ────────────────────────────────────────────────────────

def get_area_insights(area=None):
    df = requests_df.copy()
    if area and area != 'All':
        df = df[df['area'] == area]
    grouped = df.groupby(['area', 'category']).size().reset_index(name='count')
    result = []
    for a in grouped['area'].unique():
        area_df = grouped[grouped['area'] == a]
        top = area_df.loc[area_df['count'].idxmax()]
        result.append({'area': a, 'top_service': top['category'], 'demand': int(top['count'])})
    result.sort(key=lambda x: x['demand'], reverse=True)
    return result


# ─── 10. Trust Score ─────────────────────────────────────────────────────────

def get_trust_scores(area=None, category=None):
    df = providers_df.copy()
    if area and area != 'All':
        df = df[df['area'] == area]
    if category and category != 'All':
        df = df[df['category'] == category]

    df = df.copy()
    df['rating_score'] = (df['rating'] - 1) / 4 * 40
    max_completed = df['completed_services'].max() or 1
    df['completed_score'] = df['completed_services'] / max_completed * 40
    max_resp = df['response_time_hrs'].max() or 1
    df['response_score'] = (1 - df['response_time_hrs'] / max_resp) * 20
    df['trust_score'] = (df['rating_score'] + df['completed_score'] + df['response_score']).clip(0, 100).round(1)

    grouped = df.groupby(['area', 'category'])['trust_score'].mean().reset_index()
    grouped['trust_score'] = grouped['trust_score'].round(1)
    return grouped.rename(columns={'trust_score': 'avg_trust_score'}).to_dict(orient='records')


# ─── 9. KPI Summary ──────────────────────────────────────────────────────────

def get_kpi_summary(area=None, category=None):
    df = requests_df.copy()
    if area and area != 'All':
        df = df[df['area'] == area]
    if category and category != 'All':
        df = df[df['category'] == category]

    total_requests = len(df)
    most_demanded = df['category'].value_counts().idxmax() if not df.empty else 'N/A'
    avg_price = round(df['price'].mean(), 0) if not df.empty else 0

    gaps = get_service_gaps()
    best_area = gaps[0]['area'] if gaps else 'N/A'
    best_category = gaps[0]['category'] if gaps else 'N/A'

    prov = providers_df.copy()
    if area and area != 'All':
        prov = prov[prov['area'] == area]
    verified_providers = len(prov)

    return {
        'total_requests': total_requests,
        'most_demanded': most_demanded,
        'best_area_for_business': f"{best_area} ({best_category})",
        'avg_price': int(avg_price),
        'verified_providers': verified_providers,
        'service_gaps': len(gaps),
    }
