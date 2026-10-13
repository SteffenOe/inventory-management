import { useEffect, useState } from "react";
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
} from "@mantine/core";
import { IconEdit, IconDatabase, IconFlame } from "@tabler/icons-react";
import { notifications } from '@mantine/notifications';

function App() {
  const [products, setProducts] = useState([]);
  const [opened, setOpened] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error loading:", err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleTriggerSaleCampaign = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products/apply-sale", {
        method: "POST",
      });
      const data = await res.json();
      notifications.show({
        title: "Success",
        message: `${data.modifiedCount} Products updated.`,
        color: "green"
      });
      loadProducts();
    } catch (err) {
      console.error("Error while applying sale:", err);
    }
  };

  const handleEditClick = (product) => {
    const normalizedPrice = product.price ?? product.cost ?? 0;
    const normalizedLocation =
      product.location ??
      (product.street || product.city
        ? `${product.street || ""}, ${product.city || ""}`
        : "");

    setSelectedProduct({
      ...product,
      price: normalizedPrice,
      location: normalizedLocation,
      status: product.status || "standard",
    });
    setOpened(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...selectedProduct };
      delete payload.cost;
      delete payload.street;
      delete payload.city;
      delete payload.temp_notes;
      payload.schemaVersion = 4;

      await fetch(`http://localhost:5000/api/products/${selectedProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setOpened(false);
      setSelectedProduct(null);
      loadProducts();
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Paper p="md" shadow="xs" radius="md" withBorder mb="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Inventory Management Dashboard</Title>
            <Group gap="xs" mt={4}>
              <Badge color="red" variant="filled">
                GUI v4
              </Badge>
              <Text c="dimmed" size="sm">
                Evolution:{" "}
                <strong>
                  Conditional Updates of fields Sale & Rabattierung where stock
                  ≥ 20
                </strong>
              </Text>
            </Group>
          </div>
          <Group>
            <Button
              leftSection={<IconFlame size={16} />}
              color="red"
              variant="filled"
              onClick={handleTriggerSaleCampaign}
            >
              Apply sale (stock ≥ 20)
            </Button>
            <Button
              leftSection={<IconDatabase size={16} />}
              variant="light"
              onClick={loadProducts}
            >
              Update
            </Button>
          </Group>
        </Group>
      </Paper>

      <Paper shadow="xs" radius="md" withBorder p="sm">
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Title</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Price</Table.Th>
              <Table.Th>Location</Table.Th>
              <Table.Th>Stock</Table.Th>
              <Table.Th>Schema</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {products.map((p) => {
              const currentPrice = p.price ?? p.cost ?? 0;
              const isSale = p.status === "sale";

              return (
                <Table.Tr key={p._id}>
                  <Table.Td fw={500}>{p.title}</Table.Td>
                  <Table.Td>
                    <Badge color="teal" variant="light">
                      {p.category || "Hardware"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={isSale ? "red" : "gray"}
                      variant={isSale ? "filled" : "outline"}
                    >
                      {p.status ? p.status.toUpperCase() : "STANDARD"}
                    </Badge>
                  </Table.Td>
                  <Table.Td fw={700} c={isSale ? "red" : "dark"}>
                    {currentPrice.toFixed(2)} €
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <Text size="sm">{p.location || "—"}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text
                      fw={p.stock >= 20 ? 700 : 400}
                      c={p.stock >= 20 ? "orange" : "inherit"}
                    >
                      {p.stock} pcs.
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="violet" size="sm" variant="dot">
                      v{p.schemaVersion || 1}
                    </Badge>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
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
              );
            })}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Edit product (Schema v4)"
        centered
      >
        {selectedProduct && (
          <form onSubmit={handleSave}>
            <Stack gap="md">
              <TextInput
                label="Title"
                value={selectedProduct.title || ""}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    title: e.target.value,
                  })
                }
                required
              />

              <Select
                label="Category"
                data={[
                  "Hardware",
                  "Peripheral",
                  "Accesories",
                  "Office Supplies",
                ]}
                value={selectedProduct.category || "Hardware"}
                onChange={(val) =>
                  setSelectedProduct({ ...selectedProduct, category: val })
                }
              />

              <Select
                label="Status"
                data={["standard", "sale", "clearance"]}
                value={selectedProduct.status || "standard"}
                onChange={(val) =>
                  setSelectedProduct({ ...selectedProduct, status: val })
                }
              />

              <NumberInput
                label="Price (€)"
                value={selectedProduct.price ?? 0}
                decimalScale={2}
                fixedDecimalScale
                onChange={(val) =>
                  setSelectedProduct({ ...selectedProduct, price: Number(val) })
                }
              />

              <TextInput
                label="Location"
                value={selectedProduct.location || ""}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    location: e.target.value,
                  })
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
