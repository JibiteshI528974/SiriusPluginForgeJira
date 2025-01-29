import Resolver from '@forge/resolver';
//import { api, route } from '@forge/api';
import api, { route } from "@forge/api";
import {storage} from '@forge/api';

const resolver = new Resolver();

// Existing resolver function
resolver.define('getText', (req) => {
  console.log(req);
  return 'Hello, world!';
});

// New resolver function to fetch project versions
resolver.define('getProjectVersions', async (req) => {
  const { projectKey } = req.payload; // Get project key from the request payload

  try {
    // Call the Jira REST API using requestJira
    const response = await api.asUser().requestJira(route`/rest/api/3/project/${projectKey}/version`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log(response)

    console.log('Response status:', response.status); // Debugging line

    if (!response.ok) {
      throw new Error(`Failed to fetch project versions: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API response:', data); // Debugging line
    return data; // Return the API response to the frontend
  } catch (error) {
    console.error('Error fetching project versions:', error);
    throw new Error('Failed to fetch project versions');
  }
});

const records = await storage.set('records',[]);

resolver.define('addrecords',async (req)=>{
  const projectVersion = req.payload.projectVersion;
  const name = req.payload.name;
  const inumber = req.payload.inumber;

  const allrecords = await storage.get('records');

  const newrecord = {projectVersion,name,inumber};

  allrecords.push(newrecord);

  await storage.set('records',allrecords);
})

export const handler = resolver.getDefinitions();