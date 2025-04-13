import { MouseEventHandler } from "react";

import { CELL_RELATION, CELL_TYPE } from "@/constants";
import TypeASVG from "@/assets/type-a.svg";
import TypeBSVG from "@/assets/type-b.svg";
import EqualSVG from "@/assets/equal.svg";
import NotEqualSVG from "@/assets/cross.svg";

const GridCell = ({ val, rightRelation, bottomRelation, onClick, canChange, isValid }: { val: number, rightRelation: number, bottomRelation: number, onClick: MouseEventHandler, canChange: boolean, isValid: boolean }) => {
    const bgColor = !isValid ? 'bg-white bg-[repeating-linear-gradient(45deg,_rgba(255,0,0,0.3)_0,_rgba(255,0,0,0.3)_2px,_transparent_2px,_transparent_10px)]' : canChange ? 'bg-white' : 'bg-gray-100';

    return (
        <button
            className={`relative border aspect-square p-5 ${bgColor} ${canChange ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            onClick={onClick}
        >
            {val === CELL_TYPE.TYPE_A ? <img src={TypeASVG} alt="React logo" /> : <></>}
            {val === CELL_TYPE.TYPE_B ? <img src={TypeBSVG} alt="React logo" /> : <></>}
            {rightRelation != CELL_RELATION.NONE ? <img
                className={`absolute rounded-full top-1/3 -right-1/6 z-10 w-1/3 h-1/3 bg-white`}
                src={rightRelation === CELL_RELATION.EQUAL ? EqualSVG : NotEqualSVG}
            /> : <></>}
            {bottomRelation != CELL_RELATION.NONE ? <img
                className={`absolute rounded-full -bottom-1/6 left-1/3 z-10 w-1/3 h-1/3 bg-white`}
                src={bottomRelation === CELL_RELATION.EQUAL ? EqualSVG : NotEqualSVG}
            /> : <></>}
        </button>
    )
}

export default GridCell;