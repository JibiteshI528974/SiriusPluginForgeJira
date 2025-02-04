import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Button,
  Text,
  Label,
  Textfield,
  useProductContext,
  Select,
  DynamicTable,
  Modal,
  ModalTransition,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [currentPage, setCurrentPage] = useState('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState('');
  const [deliveryName, setDeliveryName] = useState('');
  const [projectVersions, setProjectVersions] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiResponse, setApiResponse] = useState([]);
  const [isAddDeliveryModalOpen, setIsAddDeliveryModalOpen] = useState(false);

  const context = useProductContext();
  const projectKey = context?.extension?.project?.key;
  const projectId = context?.extension?.project?.id; 

  console.log('Context:', context);

  
  useEffect(() => {
    if (projectKey) {
      fetchProjectVersions(projectKey);
    }
  }, [projectKey]);

  
  useEffect(() => {
    if (currentPage === 'list') {
      invoke('getDeliveriesFromStorage').then(setDeliveries);
    }
  }, [currentPage]);

  const fetchProjectVersions = async (projectKey) => {
    setLoading(true);
    setError(null);

    try {
      const versions = await invoke('getProjectVersions', { projectKey });
      setProjectVersions(versions);
    } catch (error) {
      console.error('Error fetching project versions:', error);
      setError('Failed to fetch project versions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiResponse = await invoke('getDeliveries', { deliveryname: deliveryName });
      console.log('API Response:', apiResponse);
      setApiResponse(apiResponse);

      if (apiResponse.length === 0) {
        setError('Please enter a correct delivery name.');
        return;
      }

      if (apiResponse.length > 1) {
        setIsModalOpen(true);
      } else {
        const delivery = apiResponse[0];
        await invoke('addDelivery', { version: selectedVersion, deliveryname: deliveryName, status: delivery.status });
        setCurrentPage('list');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch delivery details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = async (selectedDelivery) => {
    try {
      if(currentPage === 'addDelivery')
      {
        await invoke('createVersionAndAddDelivery', { deliveryname: selectedDelivery.programName,projectId: projectId, status: selectedDelivery.status });
        setIsModalOpen(false);
          setCurrentPage('list');
      }
      await invoke('addDelivery', { version: selectedVersion, deliveryname: selectedDelivery.programName, status: selectedDelivery.status });
      setIsModalOpen(false);
      setCurrentPage('list');
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to add delivery. Please try again.');
    }
  };

  const handleAddDeliverySubmit = async () => {
    setLoading(true);
    setError(null);
      try {
        const apiResponse = await invoke('getDeliveries', { deliveryname: deliveryName });
        console.log('API Response:', apiResponse);
        setApiResponse(apiResponse);
  
        if (apiResponse.length === 0) {
          setError('Please enter a correct delivery name.');
          return;
        }
  
        if (apiResponse.length > 1) {
          setIsModalOpen(true);
        } else {
          const delivery = apiResponse[0];
          await invoke('createVersionAndAddDelivery', { deliveryname: deliveryName,projectId: projectId, status: delivery.status });
          setCurrentPage('list');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to fetch delivery details. Please try again.');
      } finally {
        setLoading(false);
      }
  };

  
  const head = {
    cells: [
      {
        key: 'version',
        content: 'Version',
        isSortable: true,
      },
      {
        key: 'deliveryname',
        content: 'Delivery Name',
        isSortable: true,
      },
      {
        key: 'status',
        content: 'Status',
        isSortable: true,
      },
    ],
  };

  const rows = deliveries.map((delivery, index) => ({
    key: `row-${index}-${delivery.deliveryname}`,
    cells: [
      {
        key: `version-${delivery.version}`,
        content: delivery.version,
      },
      {
        key: `deliveryname-${delivery.deliveryname}`,
        content: delivery.deliveryname,
      },
      {
        key: `status-${delivery.status}`,
        content: delivery.status,
      },
    ],
  }));

  let content;
  if (currentPage === 'entry') {
    content = (
      <>
        <Text>Entry Page</Text>
        {error && <Text>{error}</Text>}
        <Label labelFor="version">Select Version:</Label>
        <Select
          appearance="default"
          options={projectVersions.map((version) => ({
            label: version.name,
            value: version.name,
          }))}
          onChange={(selectedOption) => setSelectedVersion(selectedOption.value)}
          value={selectedVersion}
        />
        <Label labelFor="deliveryname">Enter Delivery Name:</Label>
        <Textfield
          id="deliveryname"
          value={deliveryName}
          onChange={(event) => setDeliveryName(event.target.value)}
        />
        <Button onClick={handleSubmit} isDisabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </Button>
      </>
    );
  } else if (currentPage === 'list') {
    content = (
      <>
        <Text>All Deliveries</Text>
        <DynamicTable caption="List of Deliveries" head={head} rows={rows} />
        <Button onClick={() => setCurrentPage('entry')}>Link New Delivery</Button>
        <Button onClick={() => setCurrentPage('addDelivery')}>Create New Delivery</Button>
      </>
    );
  } else if (currentPage === 'addDelivery') {
    content = (
      <>
        <Text>Add Delivery</Text>
        <Label labelFor="deliveryname">Enter Delivery Name:</Label>
        <Textfield
          id="deliveryname"
          value={deliveryName}
          onChange={(event) => setDeliveryName(event.target.value)}
        />
        <Button onClick={handleAddDeliverySubmit} isDisabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </Button>
      </>
    );
  }

  return (
    <>
      {content}
      <ModalTransition>
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)}>
            <ModalHeader>
              <ModalTitle>Select Delivery</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <Text>Multiple deliveries found. Please select one:</Text>
              {apiResponse.map((delivery, index) => (
                <Button
                  key={index}
                  appearance="primary"
                  onClick={() => handleModalSubmit(delivery)}
                >
                  {delivery.programName}
                </Button>
              ))}
            </ModalBody>
            <ModalFooter>
              <Button appearance="subtle" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);