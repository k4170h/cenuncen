import styled from '@emotion/styled';
import { Box, Button, IconButton } from '@mui/material';
import { Stack } from '@mui/system';
import React, {
  createContext,
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import SettingsOverscanIcon from '@mui/icons-material/SettingsOverscan';
import FilterCenterFocusIcon from '@mui/icons-material/FilterCenterFocus';

const ZOOM_STEP = 5;
const MIN_ZOOM = 10;
const MAX_ZOOM = 200;

/**
 * 子要素をズームしたりパンしたりするコンポーネント
 */

const Base = styled(Box)({
  boxShadow: 'inset 0 1px 3px 0px rgba(0,0,0,.2)',
  overflow: 'hidden',
  width: 'calc(100% - 300px)',
  height: '100%',
  position: 'relative',
});

const TargetPan = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
});
const TargetZoom = styled(Box)({});

const ButtonWrapper = styled(Stack)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  zIndex: 100,
  // direction: 'row',
});

// 子要素に情報を与える用
const defaultPanningInfo = {
  x: 0,
  y: 0,
  zoom: 1,
};
export const PanningInfo = createContext({
  ...defaultPanningInfo,
});
export const PanningFunc = createContext<{
  moveToCenter: () => void;
  resetZoom: () => void;
  fitImage: () => void;
}>({
  moveToCenter: () => null,
  resetZoom: () => null,
  fitImage: () => null,
});

type Props = {
  children: ReactNode;
};

const PanningWrapper = forwardRef(({ children }: Props, ref) => {
  const [mouseDown, setMouseDown] = useState(false);
  const [mouseMoveFromPos, setMouseMoveFromPos] = useState<[number, number]>([
    0, 0,
  ]);
  const [targetPos, setTargetPos] = useState([0, 0]);
  // const [lastTargetSize, setLastTargetSize] = useState([0, 0]);

  const [mouseMovedTargetPos, setMouseMovedTargetPos] = useState([0, 0]);
  const baseRef = useRef<HTMLDivElement>();
  const targetRef = useRef<HTMLDivElement>();
  const lastTargetSize = useRef([0, 0]);

  // Zoom は 整数の% で扱う。小数点だと誤差出る
  const [zoom, setZoom] = useState(100);

  const [panningInfo, setPanningInfo] = useState(defaultPanningInfo);

  // マウスホイール時拡大縮小
  const zoomCanvas = useCallback(
    (v: number) => {
      if (
        !targetRef.current ||
        !targetRef.current.childNodes[0].hasChildNodes()
      ) {
        return;
      }

      const zoom_ = zoom - (zoom % ZOOM_STEP);
      if (v > 0) {
        setZoom(zoom_ - ZOOM_STEP <= MIN_ZOOM ? MIN_ZOOM : zoom_ - ZOOM_STEP);
      } else if (v < 0) {
        setZoom(zoom_ + ZOOM_STEP >= MAX_ZOOM ? MAX_ZOOM : zoom_ + ZOOM_STEP);
      }
    },
    [setZoom, zoom]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (
        !targetRef.current ||
        !targetRef.current.childNodes[0].hasChildNodes()
      ) {
        return;
      }

      // 右クリックでなければ終了
      if (e.button !== 2 && e.button !== 1) {
        return;
      }

      setMouseDown(true);
      setMouseMoveFromPos([e.clientX, e.clientY]);
      setMouseMovedTargetPos([...targetPos]);
    },
    [targetPos]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!mouseDown) {
        return;
      }

      setTargetPos([
        mouseMovedTargetPos[0] + (mouseMoveFromPos[0] - e.clientX) * -1,
        mouseMovedTargetPos[1] + (mouseMoveFromPos[1] - e.clientY) * -1,
      ]);
    },
    [mouseMoveFromPos, mouseMovedTargetPos, mouseDown]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      setMouseDown(false);
    },
    []
  );

  // 中央に移動
  const moveToCenter = useCallback(() => {
    if (!targetRef.current || !baseRef.current) {
      return;
    }

    const baseWidth = baseRef.current.clientWidth;
    const baseHeight = baseRef.current.clientHeight;
    const width = targetRef.current.clientWidth;
    const height = targetRef.current.clientHeight;
    setTargetPos([(baseWidth - width) / 2, (baseHeight - height) / 2]);
  }, []);
  // 拡大率100%に
  const resetZoom = useCallback(() => {
    setZoom(100);
  }, []);
  // 全体が映る程度に離す
  const fitImage = useCallback(() => {
    if (!targetRef.current || !baseRef.current) {
      return;
    }
    const bX = baseRef.current.clientWidth;
    const bY = baseRef.current.clientHeight;
    const tX = targetRef.current.clientWidth;
    const tY = targetRef.current.clientHeight;

    if (bX > tX && bY > tY) {
      moveToCenter();
      return;
    }

    if (tX - bX > tY - bY) {
      setZoom(Math.round((bX / tX) * 100 * 0.95));
    } else {
      setZoom(Math.round((bY / tY) * 100 * 0.95));
    }
    moveToCenter();
  }, [moveToCenter]);

  useEffect(() => {
    setPanningInfo({
      x: targetPos[0],
      y: targetPos[1],
      zoom: zoom / 100,
    });
  }, [zoom, targetPos]);

  useEffect(() => {
    if (baseRef.current) {
      baseRef.current.oncontextmenu = () => false;
      baseRef.current.onwheel = () => false;
    }
  }, []);

  // Targetのサイズが変わったらその位置で中央寄せ
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (
        !targetRef.current ||
        !targetRef.current.childNodes[0].hasChildNodes()
      ) {
        return;
      }

      const currentSize = [
        targetRef.current.clientWidth,
        targetRef.current.clientHeight,
      ];

      if (currentSize.join() === lastTargetSize.current.join()) {
        return;
      }

      const currentPos = [
        targetRef.current.offsetLeft,
        targetRef.current.offsetTop,
      ];

      setTargetPos([
        currentPos[0] + (lastTargetSize.current[0] - currentSize[0]) / 2,
        currentPos[1] + (lastTargetSize.current[1] - currentSize[1]) / 2,
      ]);

      lastTargetSize.current = [
        targetRef.current.clientWidth,
        targetRef.current.clientHeight,
      ];
    });

    targetRef.current && resizeObserver.observe(targetRef.current);

    return (): void => {
      resizeObserver.disconnect();
    };
  }, []);

  // 親コンポーネントから実施する用
  useImperativeHandle(ref, () => ({
    moveToCenter: () => {
      moveToCenter();
    },
    resetZoom: () => {
      resetZoom();
    },
    fitImage: () => {
      fitImage();
    },
  }));

  return (
    <>
      <Base
        ref={baseRef}
        onWheel={(e) => {
          zoomCanvas(e.deltaY / Math.abs(e.deltaY));
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <ButtonWrapper direction={'row'}>
          <Button disabled={true}>{zoom}%</Button>
          <Button onClick={() => resetZoom()}>Full</Button>
          <Button onClick={() => fitImage()}>Fit</Button>
          <Button onClick={() => moveToCenter()}>Center</Button>
        </ButtonWrapper>
        <TargetPan
          ref={targetRef}
          style={{
            top: targetPos[1],
            left: targetPos[0],
          }}
        >
          <TargetZoom
            style={{
              transform: `scale(${zoom * 0.01})`,
            }}
          >
            <PanningInfo.Provider value={{ ...panningInfo }}>
              <PanningFunc.Provider
                value={{ moveToCenter, resetZoom, fitImage }}
              >
                {children}
              </PanningFunc.Provider>
            </PanningInfo.Provider>
          </TargetZoom>
        </TargetPan>
      </Base>
    </>
  );
});

export default PanningWrapper;
