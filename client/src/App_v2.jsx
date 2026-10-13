import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Table,
  Button,
  Modal,
  TextInput,
  NumberInput,
  Select,
  Group,
  Stack,
  Paper,
  Text,
  Badge,
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
      console.error('Error loading:', err);
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
      const payload = { ...selectedProduct };
      delete payload.temp_notes;

      await fetch(`http://localhost:5000/api/products/${selectedProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setOpened(false);
      setSelectedProduct(null);
      loadProducts();
    } catch (err) {
      console.error('Error saving:', err);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Paper p="md" shadow="xs" radius="md" withBorder mb="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Inventory Management Dashboard</Title>
            <Group gap="xs" mt={4}>
              <Badge color="blue" variant="filled">GUI v2</Badge>
              <Text c="dimmed" size="sm">
                Evolution: <strong>Field added (Category) & Feld removed (Notes)</strong>
              </Text>
            </Group>
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
              <Table.Th>Category</Table.Th>
              <Table.Th>Cost</Table.Th>
              <Table.Th>City</Table.Th>
              <Table.Th>Stock</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {products.map((p) => (
              <Table.Tr key={p._id}>
                <Table.Td fw={500}>{p.title}</Table.Td>
                <Table.Td>
                  <Badge color={p.category ? 'teal' : 'gray'} variant="light">
                    {p.category || 'No category'}
                  </Badge>
                </Table.Td>
                <Table.Td>{p.cost !== undefined ? `${p.cost.toFixed(2)} €` : '—'}</Table.Td>
                <Table.Td>{p.city}</Table.Td>
                <Table.Td>{p.stock} pcs.</Table.Td>
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
        title="Edit Product (Schema v2)"
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

              <Select
                label="Category"
                placeholder="Select Category"
                data={['Hardware', 'Peripheral', 'Accesories', 'Office Supplies']}
                value={selectedProduct.category || null}
                onChange={(val) =>
                  setSelectedProduct({ ...selectedProduct, category: val })
                }
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