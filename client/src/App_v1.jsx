import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Table,
  Button,
  Modal,
  TextInput,
  NumberInput,
  Group,
  Stack,
  Paper,
  Text,
} from '@mantine/core';
import { IconEdit, IconDatabase } from '@tabler/icons-react';

function App() {
  const [products, setProducts] = useState([]);
  const [opened, setOpened] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Fehler beim Laden:', err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleEditClick = (product) => {
    setSelectedProduct({ ...product });
    setOpened(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:5000/api/products/${selectedProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedProduct),
      });
      setOpened(false);
      setSelectedProduct(null);
      loadProducts();
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Paper p="md" shadow="xs" radius="md" withBorder mb="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Inventory Management Dashboard</Title>
            <Text c="dimmed" size="sm">
              Status: <strong>GUI v1 (Origin Schema)</strong>
            </Text>
          </div>
          <Button
            leftSection={<IconDatabase size={16} />}
            variant="light"
            onClick={loadProducts}
          >
            Update
          </Button>
        </Group>
      </Paper>

      <Paper shadow="xs" radius="md" withBorder p="sm">
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Title</Table.Th>
              <Table.Th>Cost</Table.Th>
              <Table.Th>Note</Table.Th>
              <Table.Th>City</Table.Th>
              <Table.Th>Stock</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {products.map((p) => (
              <Table.Tr key={p._id}>
                <Table.Td fw={500}>{p.title}</Table.Td>
                <Table.Td>{p.cost !== undefined ? `${p.cost.toFixed(2)} €` : '—'}</Table.Td>
                <Table.Td c="dimmed">{p.temp_notes || '—'}</Table.Td>
                <Table.Td>{p.city}</Table.Td>
                <Table.Td>{p.stock} Stk.</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Button
                    size="xs"
                    variant="subtle"
                    leftSection={<IconEdit size={14} />}
                    onClick={() => handleEditClick(p)}
                  >
                    Edit
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Edit Product (manual data manipulation)"
        centered
      >
        {selectedProduct && (
          <form onSubmit={handleSave}>
            <Stack gap="md">
              <TextInput
                label="Title"
                value={selectedProduct.title || ''}
                onChange={(e) =>
                  setSelectedProduct({ ...selectedProduct, title: e.target.value })
                }
                required
              />

              <NumberInput
                label="Cost (€)"
                value={selectedProduct.cost ?? 0}
                decimalScale={2}
                fixedDecimalScale
                onChange={(val) =>
                  setSelectedProduct({ ...selectedProduct, cost: Number(val) })
                }
              />

              <TextInput
                label="Note"
                value={selectedProduct.temp_notes || ''}
                onChange={(e) =>
                  setSelectedProduct({ ...selectedProduct, temp_notes: e.target.value })
                }
              />

              <TextInput
                label="City"
                value={selectedProduct.city || ''}
                onChange={(e) =>
                  setSelectedProduct({ ...selectedProduct, city: e.target.value })
                }
              />

              <NumberInput
                label="Stock"
                value={selectedProduct.stock ?? 0}
                onChange={(val) =>
                  setSelectedProduct({ ...selectedProduct, stock: Number(val) })
                }
              />

              <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={() => setOpened(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>
    </Container>
  );
}

export default App;