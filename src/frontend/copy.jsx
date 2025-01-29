import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Button, Text, Label, Textfield, useProductContext, Select } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState('list');
  const [projectVersions, setProjectVersions] = useState(null); // State to store project versions
  const [loading, setLoading] = useState(false); // State to handle loading state
  const [error, setError] = useState(null); // State to handle errors
  const [selectedVersion, setSelectedVersion] = useState(''); // State to store selected version
  const [name,setname] = useState('');
  const [inumber,setinumber] = useState('')

  const context = useProductContext();

  console.log('Context:', context); // Debugging line

  const goToList = async () => {
    console.log(selectedVersion);
    console.log(name);
    console.log(inumber);
    await invoke('addrecords',{selectedVersion,name,inumber});
    setCurrentPage('list');
  };

  const goToEntry = () => {
    setCurrentPage('entry');
  };

  // Fetch project versions when context is available
  useEffect(() => {
    if (context) {
      const projectKey = context.extension.project.key; // Get the project key from context
      fetchProjectVersions(projectKey);
    }
  }, [context]);

  // Function to fetch project versions using the resolver
  const fetchProjectVersions = async (projectKey) => {
    setLoading(true);
    setError(null);

    try {
      const versions = await invoke('getProjectVersions', { projectKey }); // Call the resolver function
      setProjectVersions(versions);
    } catch (error) {
      console.error('Error fetching project versions:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Hi');
    console.log(context); // Debugging line
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);
  }, [context]); // Add context as a dependency

  const handleVersionChange = (selectedOption) => {
    setSelectedVersion(selectedOption.value);
  };

  let content;
  if (currentPage === 'list') {
    content = (
      <>
        <Text>All Entries</Text>
        <Button onClick={goToEntry}>Add New Entry</Button>
      </>
    );
  } else if (currentPage === 'entry') {
    content = (
      <>
        <Text>Entry Page</Text>
        <Label labelFor='release'>Select Release Version: </Label>
        <Select
          appearance="default"
          options={
            projectVersions
              ? projectVersions.values.map((version) => ({
                  label: version.name,
                  value: version.name,
                }))
              : []
          }
          onChange={handleVersionChange}
          value={selectedVersion}
        />
        <Label labelFor='name'>Enter Team-Member Name : </Label>
        <Textfield id='name' onChange={(event)=>{setname(event.target.value)}}></Textfield>
        <Label labelFor='inumber'>Enter I-Number : </Label>
        <Textfield id='inumber' onChange={(event)=>setinumber(event.target.value)}></Textfield>

        <Button onClick={goToList}>Add</Button>
      </>
    );
  }

  return (
    <>
      {content}
      {data && <Text>Data from invoke: {JSON.stringify(data)}</Text>}
      {context && (
        <>
          <Text>Context: {JSON.stringify(context)}</Text>
          <Text>Project Key: {context.extension.project.key}</Text>
          <Text>Project Id: {context.extension.project.id}</Text>
        </>
      )}

      {/* Display project versions */}
      {loading && <Text>Loading project versions...</Text>}
      {error && <Text>Error: {error}</Text>}
      {projectVersions && (
        <>
          <Text>Project Versions:</Text>
          <Text>Context: {JSON.stringify(projectVersions.values[0].id)}</Text>
          <Text>Context: {JSON.stringify(projectVersions.values[1].id)}</Text>
        </>
      )}
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);