import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Button, Text, Label, Textfield, useProductContext, Select, DynamicTable } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState('list');
  const [projectVersions, setProjectVersions] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 
  const [selectedVersion, setSelectedVersion] = useState(''); 
  const [name, setname] = useState('');
  const [inumber, setinumber] = useState('');
  const [records, setrecords] = useState([]);

  const context = useProductContext();

  console.log('Context:', context); 

  const goToList = async () => {
    console.log(selectedVersion);
    console.log(name);
    console.log(inumber);
    await invoke('addrecords', { selectedVersion, name, inumber });
    setCurrentPage('list'); 
  };

  const goToEntry = () => {
    setCurrentPage('entry');
  };

  
  useEffect(() => {
    if (context) {
      const projectKey = context.extension.project.key; 
      fetchProjectVersions(projectKey);
    }
  }, [context]);

  
  const fetchProjectVersions = async (projectKey) => {
    setLoading(true);
    setError(null);

    try {
      const versions = await invoke('getProjectVersions', { projectKey }); 
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
    console.log(context); 
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);
  }, [context]); 

  const handleVersionChange = (selectedOption) => {
    setSelectedVersion(selectedOption.value);
  };

  
  useEffect(() => {
    if (currentPage === 'list') {
      invoke('getRecords').then(setrecords);
    }
  }, [currentPage]); 

  const head = {
    cells: [
      {
        key: "inumber",
        content: "I-Number",
        isSortable: true,
      },
      {
        key: "name",
        content: "Name",
        isSortable: true,
      },
      {
        key: "selectedVersion",
        content: "Release Version",
        isSortable: true,
      },
    ],
  };

  const rows = records.map((record, index) => ({
    key: `row-${index}-${record.inumber}`,
    cells: [
      {
        key: `inumber-${record.inumber}`,
        content: record.inumber,
      },
      {
        key: `name-${record.name}`,
        content: record.name,
      },
      {
        key: `version-${record.selectedVersion}`,
        content: record.selectedVersion,
      },
    ],
  }));

  let content;
  if (currentPage === 'list') {
    content = (
      <>
        <Text>All Entries</Text>
        <DynamicTable
          caption="List of Entries"
          head={head}
          rows={rows}
        />
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
        <Textfield id='name' onChange={(event) => { setname(event.target.value) }}></Textfield>
        <Label labelFor='inumber'>Enter I-Number : </Label>
        <Textfield id='inumber' onChange={(event) => setinumber(event.target.value)}></Textfield>

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