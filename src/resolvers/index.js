import Resolver from '@forge/resolver';
import { storage } from '@forge/api';
import api, { route, fetch } from '@forge/api';

const resolver = new Resolver();


resolver.define('getProjectVersions', async (req) => {
  const { projectKey } = req.payload;

  try {
    const response = await api.asUser().requestJira(route`/rest/api/3/project/${projectKey}/versions`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch project versions: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching project versions:', error);
    throw new Error('Failed to fetch project versions');
  }
});


resolver.define('getDeliveries', async (req) => {
  const { deliveryname } = req.payload;
  const url = `https://jira-dev.tools.sap/rest/siriusservices/1.0/siriusjiraintegration/deliveryforprogram?projectId=48389&callForCurrentProgram=false&createDelivery=true&programOrDeliveryName=${deliveryname}`;

  const response = await fetch(url, { method: 'GET' });
  const data = await response.json();
  return data;
});


resolver.define('addDelivery', async (req) => {
  const { version, deliveryname, status } = req.payload;
  const deliveries = await storage.get('deliveries') || [];
  deliveries.push({ version, deliveryname, status });
  await storage.set('deliveries', deliveries);
});

resolver.define('createVersionAndAddDelivery', async (req) => {
  const { deliveryname, projectId, status} = req.payload;

  
  const versionName = `D_${deliveryname}`;
  const description = `Linking Delivery ${deliveryname}`;

  
  const bodyData = JSON.stringify({
    archived: false,
    description: description,
    name: versionName,
    projectId: projectId,
    releaseDate: new Date().toISOString().split('T')[0], 
    released: true,
  });

  try {
    
    const response = await api.asUser().requestJira(route`/rest/api/3/version`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: bodyData,
    });

    if (!response.ok) {
      throw new Error(`Failed to create version: ${response.statusText}`);
    }

    const versionData = await response.json();

    
    const deliveries = await storage.get('deliveries') || [];
    deliveries.push({ version: versionName, deliveryname, status: status });
    await storage.set('deliveries', deliveries);

    return versionData;
  } catch (error) {
    console.error('Error creating version:', error);
    throw new Error('Failed to create version');
  }
});

resolver.define('getDeliveriesFromStorage', async () => {
  const deliveries = await storage.get('deliveries') || [];
  return deliveries;
});

export const handler = resolver.getDefinitions();