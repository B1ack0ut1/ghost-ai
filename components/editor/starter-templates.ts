import {
  CANVAS_EDGE_TYPE,
  CANVAS_NODE_TYPE,
  DEFAULT_CANVAS_EDGE_OPTIONS,
  NODE_COLORS,
  NODE_SHAPE_DEFAULT_SIZES,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeColor,
  type CanvasNodeShape,
} from "@/types/canvas";

export interface CanvasTemplate {
  description: string;
  edges: CanvasEdge[];
  id: string;
  name: string;
  nodes: CanvasNode[];
}

interface TemplateNodeOptions {
  color?: CanvasNodeColor;
  label: string;
  shape?: CanvasNodeShape;
  x: number;
  y: number;
}

function createTemplateNode(
  id: string,
  {
    color = NODE_COLORS[0].fill,
    label,
    shape = "rectangle",
    x,
    y,
  }: TemplateNodeOptions,
): CanvasNode {
  return {
    data: { color, label, shape },
    id,
    position: { x, y },
    style: NODE_SHAPE_DEFAULT_SIZES[shape],
    type: CANVAS_NODE_TYPE,
  };
}

function createTemplateEdge(
  id: string,
  source: string,
  target: string,
  label = "",
): CanvasEdge {
  return {
    ...DEFAULT_CANVAS_EDGE_OPTIONS,
    data: { label },
    id,
    source,
    target,
    type: CANVAS_EDGE_TYPE,
  };
}

export const CANVAS_TEMPLATES: readonly CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices platform",
    description:
      "A gateway routes traffic to independently deployed services and shared data stores.",
    nodes: [
      createTemplateNode("microservices-client", {
        label: "Web client",
        shape: "circle",
        color: NODE_COLORS[1].fill,
        x: 0,
        y: 190,
      }),
      createTemplateNode("microservices-gateway", {
        label: "API gateway",
        shape: "hexagon",
        color: NODE_COLORS[7].fill,
        x: 220,
        y: 190,
      }),
      createTemplateNode("microservices-users", {
        label: "User service",
        shape: "pill",
        color: NODE_COLORS[2].fill,
        x: 480,
        y: 40,
      }),
      createTemplateNode("microservices-orders", {
        label: "Order service",
        shape: "pill",
        color: NODE_COLORS[3].fill,
        x: 480,
        y: 190,
      }),
      createTemplateNode("microservices-notifications", {
        label: "Notification service",
        shape: "pill",
        color: NODE_COLORS[5].fill,
        x: 480,
        y: 340,
      }),
      createTemplateNode("microservices-users-db", {
        label: "Users DB",
        shape: "cylinder",
        color: NODE_COLORS[6].fill,
        x: 760,
        y: 40,
      }),
      createTemplateNode("microservices-orders-db", {
        label: "Orders DB",
        shape: "cylinder",
        color: NODE_COLORS[6].fill,
        x: 760,
        y: 190,
      }),
    ],
    edges: [
      createTemplateEdge(
        "microservices-client-gateway",
        "microservices-client",
        "microservices-gateway",
      ),
      createTemplateEdge(
        "microservices-gateway-users",
        "microservices-gateway",
        "microservices-users",
      ),
      createTemplateEdge(
        "microservices-gateway-orders",
        "microservices-gateway",
        "microservices-orders",
      ),
      createTemplateEdge(
        "microservices-gateway-notifications",
        "microservices-gateway",
        "microservices-notifications",
      ),
      createTemplateEdge(
        "microservices-users-database",
        "microservices-users",
        "microservices-users-db",
      ),
      createTemplateEdge(
        "microservices-orders-database",
        "microservices-orders",
        "microservices-orders-db",
      ),
      createTemplateEdge(
        "microservices-orders-notifications",
        "microservices-orders",
        "microservices-notifications",
        "event",
      ),
    ],
  },
  {
    id: "ci-cd-pipeline",
    name: "CI/CD pipeline",
    description:
      "A pull request is built, tested, packaged, and progressively deployed to production.",
    nodes: [
      createTemplateNode("cicd-source", {
        label: "Source repository",
        shape: "hexagon",
        color: NODE_COLORS[1].fill,
        x: 0,
        y: 140,
      }),
      createTemplateNode("cicd-build", {
        label: "Build",
        shape: "pill",
        color: NODE_COLORS[2].fill,
        x: 240,
        y: 140,
      }),
      createTemplateNode("cicd-tests", {
        label: "Test suite",
        shape: "diamond",
        color: NODE_COLORS[3].fill,
        x: 480,
        y: 110,
      }),
      createTemplateNode("cicd-registry", {
        label: "Artifact registry",
        shape: "cylinder",
        color: NODE_COLORS[7].fill,
        x: 720,
        y: 140,
      }),
      createTemplateNode("cicd-staging", {
        label: "Staging",
        shape: "rectangle",
        color: NODE_COLORS[6].fill,
        x: 960,
        y: 40,
      }),
      createTemplateNode("cicd-production", {
        label: "Production",
        shape: "rectangle",
        color: NODE_COLORS[5].fill,
        x: 960,
        y: 250,
      }),
    ],
    edges: [
      createTemplateEdge("cicd-source-build", "cicd-source", "cicd-build"),
      createTemplateEdge("cicd-build-tests", "cicd-build", "cicd-tests"),
      createTemplateEdge("cicd-tests-registry", "cicd-tests", "cicd-registry"),
      createTemplateEdge(
        "cicd-registry-staging",
        "cicd-registry",
        "cicd-staging",
      ),
      createTemplateEdge(
        "cicd-staging-production",
        "cicd-staging",
        "cicd-production",
        "approve",
      ),
    ],
  },
  {
    id: "event-driven-system",
    name: "Event-driven system",
    description:
      "Services publish domain events to a broker for asynchronous downstream processing.",
    nodes: [
      createTemplateNode("events-client", {
        label: "Client app",
        shape: "circle",
        color: NODE_COLORS[1].fill,
        x: 0,
        y: 190,
      }),
      createTemplateNode("events-api", {
        label: "Orders API",
        shape: "pill",
        color: NODE_COLORS[3].fill,
        x: 220,
        y: 190,
      }),
      createTemplateNode("events-orders-db", {
        label: "Orders DB",
        shape: "cylinder",
        color: NODE_COLORS[6].fill,
        x: 220,
        y: 380,
      }),
      createTemplateNode("events-broker", {
        label: "Event broker",
        shape: "hexagon",
        color: NODE_COLORS[7].fill,
        x: 510,
        y: 190,
      }),
      createTemplateNode("events-inventory", {
        label: "Inventory worker",
        shape: "pill",
        color: NODE_COLORS[2].fill,
        x: 800,
        y: 40,
      }),
      createTemplateNode("events-notifications", {
        label: "Notifications worker",
        shape: "pill",
        color: NODE_COLORS[5].fill,
        x: 800,
        y: 190,
      }),
      createTemplateNode("events-analytics", {
        label: "Analytics worker",
        shape: "pill",
        color: NODE_COLORS[4].fill,
        x: 800,
        y: 340,
      }),
    ],
    edges: [
      createTemplateEdge("events-client-api", "events-client", "events-api"),
      createTemplateEdge("events-api-database", "events-api", "events-orders-db"),
      createTemplateEdge(
        "events-api-broker",
        "events-api",
        "events-broker",
        "order created",
      ),
      createTemplateEdge(
        "events-broker-inventory",
        "events-broker",
        "events-inventory",
      ),
      createTemplateEdge(
        "events-broker-notifications",
        "events-broker",
        "events-notifications",
      ),
      createTemplateEdge(
        "events-broker-analytics",
        "events-broker",
        "events-analytics",
      ),
    ],
  },
];
