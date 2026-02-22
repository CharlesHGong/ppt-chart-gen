import { z } from "zod";

export const nodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  subtitle: z.string().optional()
});

export const edgeSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  label: z.string().optional()
});

export const diagramSpecSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["ownership", "org", "tree"]),
  title: z.string().optional(),
  nodes: z.array(nodeSchema).min(1),
  edges: z.array(edgeSchema),
  layout: z.object({
    direction: z.enum(["TB", "LR"]).default("TB"),
    spacingX: z.number().min(10),
    spacingY: z.number().min(10),
    padding: z.number().min(0),
    nodeWidth: z.number().min(30),
    nodeHeight: z.number().min(20)
  }),
  style: z.object({
    theme: z.literal("bw"),
    fontSize: z.number().min(8),
    nodeFill: z.string(),
    nodeLine: z.string(),
    textColor: z.string(),
    connectorColor: z.string()
  })
});

export const clarificationSchema = z.object({
  need_clarification: z.literal(true),
  questions: z.array(z.string()).min(1),
  best_guess_spec: diagramSpecSchema.nullable()
});
