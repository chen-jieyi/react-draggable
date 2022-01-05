import React, { useState, useEffect, useRef } from 'react';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import Draggable, { DragItemType } from './Draggable';
import { padding } from './utils';
import type { MergeItemType } from './type';

import './DragContainer.less';

export interface SelectedDragsItem extends DragItemType {
  key: string | React.Key;
  fromKey?: string | React.Key;
}

interface DragContainerProps {
  width: number | string;
  height: number;
  minHeight: number;
  style?: React.CSSProperties;
  className?: string;
  hasExtend?: boolean;
  isCut?: boolean;
  isCopy?: boolean;
  isDelete?: boolean;
  isLock?: boolean;
  isFixed?: boolean;
  children?: React.ReactElement | React.ReactElement[];
  onChange?: (nextHeight: number) => void;
  onDragMult?: (type: string, items: SelectedDragsItem[]) => void;
  onMergeMult?: (values: MergeItemType) => void;
  setCut?: (isCut: boolean) => void;
  setCopy?: (isCopy: boolean) => void;
  setDelete?: (isDelete: boolean) => void;
  setLock?: (isLock: boolean) => void;
  setFixed?: (isFixed: boolean) => void;
  onSelect?: (keys: React.Key[]) => void;
}

const DragContainer: React.FC<DragContainerProps> = ({
  width,
  height,
  minHeight,
  style,
  className,
  hasExtend,
  isCut,
  isCopy,
  isDelete,
  isLock,
  isFixed,
  children,
  onChange,
  onDragMult,
  onMergeMult,
  setCut,
  setCopy,
  setDelete,
  setLock,
  setFixed,
  onSelect,
}) => {
  const ref = useRef<any>(null);
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
    return () => {
      window.removeEventListener('keydown', onKeydown);
      window.removeEventListener('keyup', onKeyup);
    };
  }, []);

  useEffect(() => {
    window.onmousedown = function (e) {
      if (isCut) {
        onCut(e);
        return;
      }

      if (isFixed) {
        return;
      }
      setSelected([]);
      setSelectedKeys([]);
      setClear(Date.now().toString());
    };
    return () => {
      window.onmousedown = null;
    };
  }, [isCut, isFixed]);

  useEffect(() => {
    if (isCopy) {
      onCopy();
      return;
    }
  }, [isCopy]);

  useEffect(() => {
    if (isDelete) {
      onDelete();
      return;
    }
  }, [isDelete]);

  useEffect(() => {
    if (isLock) {
      onLock();
      return;
    }
  }, [isLock, JSON.stringify(selectedDrags)]);

  // 剪切
  const onCut = (e: MouseEvent) => {
    // 拿到拖动容器的xy
    const container = ref?.current?.getBoundingClientRect?.() || { x: 0, y: 0 };
    // 通过点击坐标减去拖动容器的坐标 得出点击点在容器内的实际xy
    const nextPos = { x: e.x - container.x, y: e.y - container.y };
    // 用于多选时 通过计算多选框的移动位置算出每个对象的移动位置
    const dv = { x: nextPos.x - curPos.x, y: nextPos.y - curPos.y };
    let nextSelectedDrags =
      selectedDrags.length > 1
        ? [...selectedDrags].map((sd) => ({
            ...sd,
            x: sd.x + dv.x,
            y: sd.y + dv.y,
          }))
        : [...selectedDrags].map((sd) => ({
            ...sd,
            x: nextPos.x,
            y: nextPos.y,
          }));
    // nextSelectedDrags =
    setCurPos({ x: nextPos.x, y: nextPos.y });
    setSelected(nextSelectedDrags);
    onDragMult && onDragMult('change', nextSelectedDrags);
    setClear(Date.now().toString());
    setCut?.(false);
  };

  // 复制
  const onCopy = () => {
    const distance = 10;
    let newSelectedDrags = [...selectedDrags].map((sd, index) => ({
      ...sd,
      key: Date.now() + index,
      fromKey: sd.key,
      x: sd.x + distance,
      y: sd.y + distance,
    }));
    // console.log(newSelectedDrags);
    setCurPos({ x: curPos.x + distance, y: curPos.y + distance });
    setSelected(newSelectedDrags);
    setSelectedKeys(newSelectedDrags.map((sd) => sd.key));
    onDragMult && onDragMult('push', newSelectedDrags);
    setClear(Date.now().toString());
    setCopy?.(false);
  };

  // 删除
  const onDelete = () => {
    // console.log('1');
    onDragMult && onDragMult('remove', [...selectedDrags]);
    setSelected([]);
    setSelectedKeys([]);
    setClear(Date.now().toString());
    setDelete?.(false);
  };

  // 锁定
  const onLock = () => {
    if (selectedKeys.length > 1) return;
    // console.log(selectedDrags);
    let nextSelectedDrags = selectedKeys.map((s) => ({ key: s, x: 0, y: 0 }));
    setSelected(nextSelectedDrags);
    onDragMult && onDragMult('lock', nextSelectedDrags);
    setClear(Date.now().toString());
    setLock?.(false);
  };

  const onExtendArea = (h?: number) => {
    let nextHeight = h ? height + h : minHeight;
    onChange && onChange(nextHeight);
  };

  // 多选拖动
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
    onDragMult && onDragMult('change', nextSelectedDrags);
    // console.log('1');
    setClear(Date.now().toString());
  };

  //
  const onDragStart = (key: React.Key | null) => {
    // console.log(key);
    if (!key) return;
    if (isMult) {
      let nextSelectedKeys = [...selectedKeys];
      nextSelectedKeys.push(key);
      setSelectedKeys(nextSelectedKeys);
      onSelect?.(nextSelectedKeys);
      return;
    }
    setSelectedKeys([key]);
    onSelect?.([key]);
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

  // 清除
  const onClear = () => {
    setClear(Date.now().toString());
  };

  // 合并
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

  // console.log(curPos);
  // console.log(selectedKeys);
  return (
    <div
      ref={ref}
      className={`drag-container ${className || ''}`}
      style={{
        ...style,
        height,
        width,
        backgroundColor: '#fff',
      }}
      onMouseDown={(e) => {
        // console.log('ref', e);
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
        <div className={'extend'}>
          <div className={'button'}>
            <CaretUpOutlined className={'icon'} onClick={onExtendArea.bind(this, undefined)} />
            <CaretDownOutlined className={'icon'} onClick={onExtendArea.bind(this, 300)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DragContainer;
