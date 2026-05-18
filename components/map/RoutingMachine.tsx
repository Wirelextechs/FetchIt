import L from "leaflet";
import { createControlComponent } from "@react-leaflet/core";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const createRoutineMachineLayer = (props: any) => {
  const { waypoints, ...rest } = props;
  const instance = L.Routing.control({
    waypoints,
    lineOptions: {
      extendToWaypoints: true,
      missingRouteTolerance: 0,
      styles: [{ color: "#3b82f6", weight: 4, opacity: 0.7 }],
    },
    show: false,
    addWaypoints: false,
    routeWhileDragging: false,
    fitSelectedRoutes: true,
    showAlternatives: false,
    ...rest
  });

  return instance;
};

const RoutingMachine = createControlComponent(createRoutineMachineLayer);

export default RoutingMachine;
