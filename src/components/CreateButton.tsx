import { useContext } from "react"
import { RoomContext } from "../context/RoomContext"

export const CreateButton: React.FC = () => {

    const {ws} = useContext(RoomContext);

    const createRoom = () => {
        ws.emit("create-room");
    }

    return (
        <button onClick={createRoom} className='rounded-full bg-orange-500 py-2 px-4 text-xl text-white hover:bg-orange-600 font-semibold'>Start a Meeting</button>
    )
}