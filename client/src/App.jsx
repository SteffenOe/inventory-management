import { useState } from "react";
import {
  Container,
  Paper,
  Group,
  SegmentedControl,
  Text, 
  Badge,
  Button,
  Menu,
} from "@mantine/core";
import {
  IconDatabase,
  IconRotateDot,
  IconArrowRight,
  IconChevronDown,
} from "@tabler/icons-react";

import AppV1 from "./App_v1.jsx";
import AppV2 from "./App_v2.jsx";
import AppV3 from "./App_v3.jsx";
import AppV4 from "./App_v4.jsx";

export default function App() {
  const [version, setVersion] = useState("v1");
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const triggerDbAction = async (endpoint, targetVersion = null) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/dev/${endpoint}`, {
        method: "POST",
      });
      const data = await res.json();
      console.log("DB-Action executed:", data);

      if (targetVersion) {
        setVersion(targetVersion);
      }
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Error executing DB-Action:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Paper
        p="xs"
        shadow="sm"
        radius={0}
        withBorder
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "var(--mantine-color-body)",
        }}
      >
        <Container size="lg">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Badge variant="dot" color="blue" ml="xs">
                Active: {version.toUpperCase()}
              </Badge>
            </Group>

            <Group gap="xs">
              <Text size="xs" c="dimmed">
                UI-Version:
              </Text>
              <SegmentedControl
                value={version}
                onChange={setVersion}
                data={[
                  { label: "v1 Base", value: "v1" },
                  { label: "v2 Add/Remove", value: "v2" },
                  { label: "v3 Rename/Merge", value: "v3" },
                  { label: "v4 Conditional", value: "v4" },
                ]}
                color="blue"
                size="xs"
              />
            </Group>

            <Group gap="xs">
              <Button
                size="xs"
                variant="light"
                color="red"
                leftSection={<IconRotateDot size={14} />}
                loading={loading}
                onClick={() => triggerDbAction("reset-v1", "v1")}
              >
                Reset DB (v1)
              </Button>

              <Menu shadow="md" width={220} position="bottom-end">
                <Menu.Target>
                  <Button
                    size="xs"
                    variant="filled"
                    color="teal"
                    leftSection={<IconDatabase size={14} />}
                    rightSection={<IconChevronDown size={12} />}
                    loading={loading}
                  >
                    DB-Transformation
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Schema-Migration</Menu.Label>
                  <Menu.Item
                    leftSection={<IconArrowRight size={14} />}
                    onClick={() => triggerDbAction("migrate-v2", "v2")}
                  >
                    Migrate to v2
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconArrowRight size={14} />}
                    onClick={() => triggerDbAction("migrate-v3", "v3")}
                  >
                    Migrate to v3
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Container>
      </Paper>

      {version === "v1" && <AppV1 key={`v1-${refreshKey}`} />}
      {version === "v2" && <AppV2 key={`v2-${refreshKey}`} />}
      {version === "v3" && <AppV3 key={`v3-${refreshKey}`} />}
      {version === "v4" && <AppV4 key={`v4-${refreshKey}`} />}
    </div>
  );
}
