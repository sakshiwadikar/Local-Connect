import { getFirestore, collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { generateMockServices } from '../data/mockServices';

export const seedProviderServices = async () => {
  try {
    const db = getFirestore();
    const servicesCollection = collection(db, 'services');

    // Check if data already exists
    const existingServices = await getDocs(servicesCollection);
    if (existingServices.size > 0) {
      console.log('Services already exist in Firestore. Skipping seed.');
      return;
    }

    // Generate mock services
    const mockServices = generateMockServices(100);

    // Provider demo accounts - distribute services among them
    const demoProviders = [
      { uid: 'demo_provider_1', displayName: 'Rajesh Kumar', email: 'rajesh@example.com' },
      { uid: 'demo_provider_2', displayName: 'Priya Sharma', email: 'priya@example.com' },
      { uid: 'demo_provider_3', displayName: 'Amit Singh', email: 'amit@example.com' },
      { uid: 'demo_provider_4', displayName: 'Meera Nair', email: 'meera@example.com' },
      { uid: 'demo_provider_5', displayName: 'Vikram Desai', email: 'vikram@example.com' },
    ];

    let successCount = 0;

    for (let i = 0; i < mockServices.length; i++) {
      const mockService = mockServices[i];
      const provider = demoProviders[i % demoProviders.length];

      const serviceData = {
        ownerUid: provider.uid,
        ownerName: provider.displayName,
        ownerEmail: provider.email,
        businessName: mockService.name,
        category: mockService.category,
        description: `Professional ${mockService.category.toLowerCase()} service with ${mockService.reviews} satisfied customers. Rating: ${mockService.rating}/5`,
        phone: '98' + String(9000000 + i).padStart(8, '0'),
        email: `${mockService.name.replace(/\s+/g, '').toLowerCase()}@example.com`,
        website: `https://${mockService.name.replace(/\s+/g, '').toLowerCase()}.com`,
        location: {
          state: 'Maharashtra',
          city: mockService.location,
          address: `${i + 1}, Service Street, ${mockService.location}`
        },
        price: mockService.price,
        trustScore: mockService.trustScore,
        rating: parseFloat(mockService.rating),
        reviews: mockService.reviews,
        verified: mockService.verified,
        image: mockService.image,
        views: Math.floor(Math.random() * 5000) + 100,
        createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)),
        updatedAt: Timestamp.now()
      };

      try {
        await addDoc(servicesCollection, serviceData);
        successCount++;
      } catch (err) {
        console.error(`Error adding service ${mockService.name}:`, err);
      }
    }

    console.log(`✅ Successfully seeded ${successCount} services to Firestore`);
    return successCount;
  } catch (err) {
    console.error('Error seeding services:', err);
    throw err;
  }
};
