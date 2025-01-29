import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
import { storage } from '@forge/api';

const resolver = new Resolver();


resolver.define('getText', (req) => {
  console.log(req);
  return 'Hello, world!';
});


resolver.define('getProjectVersions', async (req) => {
  const { projectKey } = req.payload; 

  try {
    
    const response = await api.asUser().requestJira(route`/rest/api/3/project/${projectKey}/version`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log(response);

    console.log('Response status:', response.status); 

    if (!response.ok) {
      throw new Error(`Failed to fetch project versions: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API response:', data); 
    return data; 
  } catch (error) {
    console.error('Error fetching project versions:', error);
    throw new Error('Failed to fetch project versions');
  }
});


resolver.define('addrecords', async (req) => {
  const { selectedVersion, name, inumber } = req.payload;

  const allrecords = await storage.get('records') || [];

  const newrecord = { selectedVersion: selectedVersion, name: name, inumber: inumber };

  allrecords.push(newrecord);

  await storage.set('records', allrecords);
});


resolver.define('getRecords', async () => {
  const records = await storage.get('records') || [];
  return records;
});

export const handler = resolver.getDefinitions();