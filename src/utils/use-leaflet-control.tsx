import { useState, forwardRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { createElementHook, createControlHook } from '@react-leaflet/core';
import { Control, DomUtil, DomEvent, Map as LeafletMap } from 'leaflet';

/* eslint-disable @typescript-eslint/no-explicit-any */

const DumbControl = Control.extend({
  options: {
    className: '',
    onOff: '',
    handleOff: () => undefined,
  },

  onAdd(/* map */) {
    const _controlDiv = DomUtil.create('div', this.options.className);
    DomEvent.disableClickPropagation(_controlDiv);
    return _controlDiv;
  },

  onRemove(map: LeafletMap) {
    if (this.options.onOff) {
      map.off(this.options.onOff, this.options.handleOff, this);
    }

    return this;
  },
});

const createControl = (props: unknown, context: unknown) => {
  const instance = new DumbControl(props as any);
  return { instance, context: { ...(context as any), overlayContainer: instance } };
};

const useControlElement = createElementHook(createControl);
const useControl = createControlHook(useControlElement);

//create your forceUpdate hook
const useForceUpdate = () => {
  const [_, setValue] = useState(0); // integer state
  return useCallback(() => setValue((value) => value + 1), []); // update the state to force render
};

const createLeafletControl = (useElement: unknown) => {
  const Component = (
    props: { children?: React.ReactNode } & Record<string, unknown>,
    _ref: unknown,
  ) => {
    const forceUpdate = useForceUpdate();
    const { instance } = (useElement as any)(props).current;

    useEffect(() => {
      // Origin: https://github.com/LiveBy/react-leaflet-control/blob/master/lib/control.jsx
      // This is needed because the control is only attached to the map in
      // MapControl's componentDidMount, so the container is not available
      // until this is called. We need to now force a render so that the
      // portal and children are actually rendered.
      forceUpdate();
    }, [forceUpdate]);

    const contentNode = instance.getContainer();
    return contentNode ? createPortal(props.children, contentNode) : null;
  };
  const LeafletControl = forwardRef(Component as any);
  // Name the forwarded component so Fast Refresh can identify it
  // and avoid anonymous export issues.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - displayName is allowed on function components
  LeafletControl.displayName = 'LeafletControl';
  return LeafletControl;
};

const LeafletControlExport = createLeafletControl(useControl);

export default LeafletControlExport;
