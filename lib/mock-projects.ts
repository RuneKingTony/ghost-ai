import type { Project } from "@/types/project"

const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Checkout Redesign",
    slug: "checkout-redesign",
    isOwner: true,
  },
  {
    id: "2",
    name: "Notification Service",
    slug: "notification-service",
    isOwner: true,
  },
  {
    id: "3",
    name: "Partner Integration",
    slug: "partner-integration",
    isOwner: false,
  },
]

export { MOCK_PROJECTS }
