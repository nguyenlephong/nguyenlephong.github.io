import type { StudioRouteId } from "./studio-route-catalog";
import type { StudioUiCopy } from "./studio-shell-copy";
import type {
  StudioProfileMenuItem,
  StudioRouteActivationSource
} from "./studio-shell-navigation";

export type StudioFeatureProps = {
  routeId: StudioRouteId;
  locale: string;
  copy: StudioUiCopy;
  profileActions: StudioProfileMenuItem[];
  onActivate: (routeId: StudioRouteId, source?: StudioRouteActivationSource) => void;
};
