import { useRef, useState } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { Grid, OrbitControls, TransformControls } from '@react-three/drei';
import { Group } from 'three';
import { LayoutItem } from '../../types';
import { clampAndSnap, collisionIds, layout2DTo3D, layout3DTo2D } from '../../utils/layout3d';

interface Scene3DProps { lengthFt: number; widthFt: number; heightFt: number; items: LayoutItem[]; selectedItemId: string | null; onSelect: (id: string) => void; onUpdate: (id: string, updates: Partial<LayoutItem>) => void; }
const materialColor = (item: LayoutItem) => item.customizations?.colorHex || (item.category?.toLowerCase().includes('bed') ? '#9f7154' : '#78655a');

function Furniture({ item, selected, invalid, room, onSelect, onUpdate, setOrbitDragging }: { item: LayoutItem; selected: boolean; invalid: boolean; room: Scene3DProps; onSelect: (id: string) => void; onUpdate: Scene3DProps['onUpdate']; setOrbitDragging: (v: boolean) => void }) {
  const group = useRef<Group>(null!), [pointerDrag, setPointerDrag] = useState(false);
  const height = item.verticalHeightFt || 2.5, position = layout2DTo3D(item);
  const commit = (worldX: number, worldZ: number) => { const next = layout3DTo2D(worldX, worldZ, item); onUpdate(item.id, clampAndSnap(item, next.x, next.y, room.lengthFt, room.widthFt)); };
  const select = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(item.id); };
  const moveOnFloor = (e: ThreeEvent<PointerEvent>) => { if (pointerDrag) { e.stopPropagation(); commit(e.point.x, e.point.z); } };
  const content = <group ref={group} position={[position.x, position.y, position.z]} rotation={[0, -item.rotation * Math.PI / 180, 0]}>
    <mesh castShadow receiveShadow onClick={select} onPointerDown={(e) => { e.stopPropagation(); onSelect(item.id); setPointerDrag(true); setOrbitDragging(true); }} onPointerMove={moveOnFloor} onPointerUp={(e) => { e.stopPropagation(); setPointerDrag(false); setOrbitDragging(false); }}>
      <boxGeometry args={[item.widthFt, height, item.heightFt]} /><meshStandardMaterial color={invalid ? '#dc2626' : materialColor(item)} emissive={selected ? '#3826a8' : '#000'} emissiveIntensity={selected ? .25 : 0} />
    </mesh>
    {selected && <mesh><boxGeometry args={[item.widthFt + .12, height + .12, item.heightFt + .12]} /><meshBasicMaterial color={invalid ? '#ef4444' : '#6d5dfc'} wireframe /></mesh>}
  </group>;
  return selected ? <TransformControls mode="translate" object={group} showY={false} onMouseDown={() => setOrbitDragging(true)} onMouseUp={() => { setOrbitDragging(false); if (group.current) commit(group.current.position.x, group.current.position.z); }} onObjectChange={() => { if (group.current) group.current.position.y = height / 2; }}>{content}</TransformControls> : content;
}

function RoomShell({ lengthFt, widthFt, heightFt }: Pick<Scene3DProps, 'lengthFt' | 'widthFt' | 'heightFt'>) { const wall = <meshStandardMaterial color="#e9e2d8" roughness={.9} />; return <><mesh rotation={[-Math.PI / 2, 0, 0]} position={[lengthFt / 2, 0, widthFt / 2]} receiveShadow><planeGeometry args={[lengthFt, widthFt]} /><meshStandardMaterial color="#b8946c" /></mesh><mesh position={[lengthFt / 2, heightFt / 2, 0]}><boxGeometry args={[lengthFt, heightFt, .15]} />{wall}</mesh><mesh position={[0, heightFt / 2, widthFt / 2]}><boxGeometry args={[.15, heightFt, widthFt]} />{wall}</mesh></>; }

export function Scene3D(props: Scene3DProps) { const [orbitDragging, setOrbitDragging] = useState(false), invalid = collisionIds(props.items); return <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-950"><Canvas shadows camera={{ position: [props.lengthFt * 1.05, props.heightFt * 1.1, props.widthFt * 1.3], fov: 46 }} onPointerMissed={() => props.onSelect('')}><color attach="background" args={['#101827']} /><ambientLight intensity={.7} /><directionalLight position={[props.lengthFt / 2, props.heightFt, props.widthFt / 3]} intensity={1.4} castShadow /><RoomShell {...props} />{props.items.map(item => <Furniture key={item.id} item={item} selected={item.id === props.selectedItemId} invalid={invalid.has(item.id)} room={props} onSelect={props.onSelect} onUpdate={props.onUpdate} setOrbitDragging={setOrbitDragging} />)}<Grid args={[props.lengthFt * 2, props.widthFt * 2]} position={[props.lengthFt / 2, .01, props.widthFt / 2]} cellSize={1} cellColor="#5d6877" sectionSize={5} sectionColor="#8994a5" /><OrbitControls makeDefault enabled={!orbitDragging} target={[props.lengthFt / 2, 2, props.widthFt / 2]} maxPolarAngle={Math.PI / 2.05} /></Canvas><div className="absolute left-3 top-3 rounded-lg border border-white/15 bg-slate-950/75 px-2.5 py-1.5 text-[10px] font-medium text-slate-200">Click to select · drag to move · gizmo for precision{invalid.size ? ' · red = collision' : ''}</div></div>; }
