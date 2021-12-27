import React, { useState, useEffect } from 'react';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import Draggable, { DragItemType } from './Draggable';
import { padding } from './utils';
import type { MergeItemType } from './type';

import styles from './DragContainer.less';

export interface SelectedDragsItem extends DragItemType {
  key: string | React.Key;
}

interface DragContainerProps {
  width: number | string;
  height: number;
  minHeight: number;
  style?: React.CSSProperties;
  className?: string;
  hasExtend?: boolean;
  children?: React.ReactElement | React.ReactElement[];
  onChange?: (nextHeight: number) => void;
  onDragMult?: (items: SelectedDragsItem[]) => void;
  onMergeMult?: (values: MergeItemType) => void;
}

const DragContainer: React.FC<DragContainerProps> = ({
  width,
  height,
  minHeight,
  style,
  className,
  hasExtend,
  children,
  onChange,
  onDragMult,
  onMergeMult,
}) => {
  const [isMult, setMult] = useState(false);
  const [selectedDrags, setSelected] = useState<SelectedDragsItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [curPos, setCurPos] = useState({ y: 0, x: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [allClear, setClear] = useState('');

  useEffect(() => {
    const onKeydown = function (e: KeyboardEvent) {
      if (e.keyCode == 17) {
        setMult(true);
        onClear();
      }
    };

    const onKeyup = function (e: KeyboardEvent) {
      if (e.keyCode == 17) setMult(false);
    };
    window.addEventListener('keydown', onKeydown);
    window.addEventListener('keyup', onKeyup);
    window.onmousedown = function (e) {
      // console.log(e);
      setSelected([]);
      setSelectedKeys([]);
      setClear(Date.now().toString());
    };
    return () => {
      window.removeEventListener('keydown', onKeydown);
      window.removeEventListener('keyup', onKeyup);
      window.onmousedown = null;
    };
  }, []);

  const onExtendArea = (h?: number) => {
    let nextHeight = h ? height + h : minHeight;
    onChange && onChange(nextHeight);
  };

  const onDrag = (nextPos: { x: number; y: number }) => {
    const dv = { x: nextPos.x - curPos.x, y: nextPos.y - curPos.y };
    let nextSelectedDrags = [...selectedDrags].map((sd) => ({
      ...sd,
      x: sd.x + dv.x,
      y: sd.y + dv.y,
    }));
    // nextSelectedDrags =
    setCurPos(nextPos);
    setSelected(nextSelectedDrags);
    onDragMult && onDragMult(nextSelectedDrags);
    // console.log('1');
    setClear(Date.now().toString());
  };

  const onDragStart = (key: React.Key | null) => {
    // console.log(key);
    if (!key) return;
    if (isMult) {
      let nextSelectedKeys = [...selectedKeys];
      nextSelectedKeys.push(key);
      setSelectedKeys(nextSelectedKeys);
      return;
    }
    setSelectedKeys([key]);
    // setClear(Date.now().toString());
  };

  // 在拖动松开时记录选中的对象，可以拿到最后的位置，用onDragStart会有位置误差
  const onDragEnd = (children: React.ReactElement, e: MouseEvent, item: DragItemType) => {
    // console.log(item);
    if (!children.key) return;
    if (isMult && selectedDrags.findIndex((sd) => sd.key == children.key) !== -1) return;
    if (isMult) {
      let nextSelectedDrags = [...selectedDrags];
      nextSelectedDrags.push({ key: children.key, ...item });
      let curPos = {
        x: Math.min(...nextSelectedDrags.map((d) => d.x)) - padding,
        y: Math.min(...nextSelectedDrags.map((d) => d.y)) - padding,
      };
      // console.log(nextSelectedDrags);
      setCurPos(curPos);
      setSelected(nextSelectedDrags);
      setSize({
        width:
          Math.max(...nextSelectedDrags.map((item) => item.x + (item.width || 0))) -
          curPos.x +
          padding * 2,
        height:
          Math.max(...nextSelectedDrags.map((item) => item.y + (item.height || 0))) -
          curPos.y +
          padding * 2,
      });
      return;
    }
    setSelected([{ key: children.key, ...item }]);
  };

  const onClear = () => {
    setClear(Date.now().toString());
  };

  const childrenRender = (children: React.ReactElement) => {
    // console.log(children.type);
    return (
      <children.type
        {...children.props}
        key={children.key}
        allClear={allClear}
        selectedKey={selectedKeys?.[0]}
        isMult={selectedDrags.length > 1}
        isSelected={selectedKeys.findIndex((key) => key == children.key) !== -1}
        onDragStart={onDragStart.bind(this, children.key)}
        onDragEnd={onDragEnd.bind(this, children)}
        onClear={onClear}
      />
    );
  };

  const onMerge = () => {
    // console.log(selectedDrags, size, curPos);
    let key = Date.now().toString();
    onMergeMult &&
      onMergeMult({
        key,
        // ...curPos,
        x: curPos.x + padding,
        y: curPos.y + padding,
        width: size.width - padding * 2,
        height: size.height - padding * 2,
        children: selectedDrags.map((d) => d.key),
      });
    setSelected([]);
    // console.log(key);
    // setSelectedKeys([key]);
  };
  // console.log(curPos);
  return (
    <div
      className={`${styles['drag-container']} ${className || ''}`}
      style={{
        ...style,
        height,
        width,
        backgroundColor: '#fff',
      }}
    >
      {Array.isArray(children)
        ? children.map((c) => childrenRender(c))
        : children
        ? childrenRender(children)
        : null}
      {selectedDrags.length > 1 && (
        <Draggable
          // x={curPos.x}
          // y={curPos.y}
          position={curPos}
          onDrag={onDrag}
          toolRender={() => (
            <div style={{ position: 'absolute', right: -30 }} onClick={onMerge}>
              合并
            </div>
          )}
        >
          <div
            style={{
              width: size.width,
              height: size.height,
              border: '1px dashed #d9d5d5',
              position: 'relative',
            }}
          ></div>
        </Draggable>
      )}
      {hasExtend && (
        <div className={styles.extend}>
          <div className={styles.button}>
            <CaretUpOutlined className={styles.icon} onClick={onExtendArea.bind(this, undefined)} />
            <CaretDownOutlined className={styles.icon} onClick={onExtendArea.bind(this, 300)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DragContainer;
