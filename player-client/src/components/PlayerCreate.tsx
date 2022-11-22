type Props = {
  setUser: any,
  setUsername: any,
  username: string,
  setRoomId: any,
  roomId: string,
}
export default function PlayerCreate({setUser, setUsername, username, setRoomId, roomId}:Props) {


  const handleClick=(username:string, roomId:string) => {
    setUser(username, roomId)
  }
  return(
    <>
     <input placeholder="Room ID" onChange={(e:any)=>setRoomId(e.target.value)}>
        
        </input>
     <input placeholder="username" onChange={(e:any)=>setUsername(e.target.value)}>
        
        </input>
        <button onClick={()=>handleClick(username, roomId)}>Submit Room ID and Username</button>
    </>
  )
}