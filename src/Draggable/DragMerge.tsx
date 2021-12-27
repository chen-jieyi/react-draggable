import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface DragMergeProps {
  parentKey?: string;
  selectedKey?: string;
  width?: number;
  height?: number;
  allClear?: string;
  children?: React.ReactElement | React.ReactElement[];
}

const DragMerge: React.ForwardRefRenderFunction<unknown, DragMergeProps> = (
  { allClear, selectedKey, parentKey, width, height, children },
  ref,
) => {
  const mergeRef = useRef(null);
  const [selectedKeys, setSelectedKeys] = useState<React.Key | undefined>();

  useImperativeHandle(ref, () => mergeRef?.current);

  useEffect(() => {
    // window.onmousedown = function (e) {
    //   console.log(e);
    //   setSelectedKeys(undefined);
    // };
    // console.log(allClear);
    setSelectedKeys(undefined);
  }, [allClear]);

  useEffect(() => {
    // console.log(selectedKey, parentKey);
    if (selectedKey != parentKey) {
      setSelectedKeys(undefined);
    }
  }, [selectedKey, parentKey]);

  //   const onMouseDown = (e) => {
  //     console.log(e);
  //   };

  const onDragStart = (key: React.Key | null) => {
    // console.log(key);
    if (!key) return;
    if (key == selectedKeys) {
      setSelectedKeys(undefined);
      return;
    }
    setSelectedKeys(key);
  };

  //   const onDragEnd = () => {
  //     window.onmousedown = function (e) {
  //       console.log(e);
  //     };
  //   };

  const childrenRender = (children: React.ReactElement) => {
    // console.log(children.type);
    return (
      <children.type
        {...children.props}
        key={children.key}
        // isMult={selectedDrags.length > 1}
        isSelected={selectedKeys == children.key}
        onDragStart={onDragStart.bind(this, children.key)}
        // onDragEnd={onDragEnd.bind(this, children)}
      />
    );
  };
  return (
    <div style={{ width, height }} ref={mergeRef}>
      {Array.isArray(children)
        ? children.map((c) => childrenRender(c))
        : children
        ? childrenRender(children)
        : null}
    </div>
  );
};

export default forwardRef(DragMerge);
