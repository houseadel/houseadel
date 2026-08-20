/**
 * Builds the relief's particle cloud off the main thread.
 *
 * The build is a few hundred thousand bilinear samples writing into three typed
 * arrays: pure arithmetic with no DOM, which makes it exactly the wrong thing to
 * run on the main thread and exactly the right thing for a worker. Done inline it
 * was the longest task on the home page by a wide margin and dominated the frame
 * budget for the first second of the visit.
 *
 * The buffers are transferred rather than copied, so handing them back costs
 * nothing.
 */
import { buildReliefPoints, type ReliefHeightField } from "./reliefData";

export type ReliefPointsRequest = {
  field: { width: number; height: number; data: Float32Array };
  targetCount: number;
  depth: number;
};

export type ReliefPointsResponse = {
  settled: Float32Array;
  scattered: Float32Array;
  heights: Float32Array;
  count: number;
};

self.onmessage = (event: MessageEvent<ReliefPointsRequest>) => {
  const { field, targetCount, depth } = event.data;
  const cloud = buildReliefPoints(field as ReliefHeightField, targetCount, depth);
  const response: ReliefPointsResponse = {
    settled: cloud.settled,
    scattered: cloud.scattered,
    heights: cloud.heights,
    count: cloud.count,
  };
  (self as unknown as Worker).postMessage(response, [
    cloud.settled.buffer,
    cloud.scattered.buffer,
    cloud.heights.buffer,
  ]);
};
