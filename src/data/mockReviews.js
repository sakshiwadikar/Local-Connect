export function generateMockReviews() {
  const reviewComments = [
    'Amazing service! Very professional and timely. Highly recommend!',
    'Great experience from start to finish. Would use again!',
    'Excellent quality work. The team was courteous and efficient.',
    'Very satisfied with the results. Fair pricing for what you get.',
    'Outstanding service. They went above and beyond expectations.',
    'Reliable and trustworthy. Would definitely recommend to others.',
    'Quick response time and excellent communication throughout.',
    'Exactly what I was looking for. Will be back soon!',
  ];

  const reviews = [];
  let id = 1;

  // Generate 2-4 reviews per service for first 30 services
  for (let serviceId = 1; serviceId <= 30; serviceId++) {
    const numReviews = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < numReviews; i++) {
      const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars mostly
      reviews.push({
        id: String(id++),
        serviceId: String(serviceId),
        rating,
        comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
        userName: `Customer ${Math.floor(Math.random() * 10000)}`,
        userEmail: `customer${Math.floor(Math.random() * 10000)}@example.com`,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  return reviews;
}

export function getServiceReviews(serviceId) {
  const allReviews = generateMockReviews();
  return allReviews.filter(r => r.serviceId === String(serviceId));
}

export function getAverageRating(serviceId) {
  const reviews = getServiceReviews(serviceId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / reviews.length).toFixed(1);
}

export function getReviewCount(serviceId) {
  return getServiceReviews(serviceId).length;
}
