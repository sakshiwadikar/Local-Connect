from flask import Flask, jsonify, request
from flask_cors import CORS
from model import (
    get_demand_trends,
    get_category_popularity,
    get_area_demand,
    get_service_gaps,
    get_business_recommendations,
    get_price_analytics,
    get_predictions,
    get_trust_scores,
    get_kpi_summary,
    get_booming_services,
    get_area_insights,
)

app = Flask(__name__)
CORS(app)


def area_param():
    return request.args.get('area', 'All')


def category_param():
    return request.args.get('category', 'All')


@app.route('/api/kpi')
def kpi():
    return jsonify(get_kpi_summary(area_param(), category_param()))


@app.route('/api/demand-trends')
def demand_trends():
    return jsonify(get_demand_trends(area_param(), category_param()))


@app.route('/api/category-popularity')
def category_popularity():
    return jsonify(get_category_popularity(area_param()))


@app.route('/api/area-demand')
def area_demand():
    return jsonify(get_area_demand(category_param()))


@app.route('/api/service-gaps')
def service_gaps():
    return jsonify(get_service_gaps())


@app.route('/api/booming-services')
def booming_services():
    return jsonify(get_booming_services(area_param()))


@app.route('/api/business-recommendations')
def business_recommendations():
    area = area_param()
    recs_by_area = get_business_recommendations()
    if area and area != 'All':
        flat = recs_by_area.get(area, [])
    else:
        flat = [rec for recs in recs_by_area.values() for rec in recs]
    return jsonify(flat)


@app.route('/api/price-insights')
def price_insights():
    return jsonify(get_price_analytics(area_param()))


@app.route('/api/predictions')
def predictions():
    return jsonify(get_predictions(area_param()))


@app.route('/api/area-insights')
def area_insights():
    return jsonify(get_area_insights(area_param()))


@app.route('/api/trust-scores')
def trust_scores():
    return jsonify(get_trust_scores(area_param(), category_param()))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
