type Props = {
  setUser: any,
  setUsername: any,
  username: string,
}
export default function PlayerCreate({setUser, setUsername, username}:Props) {


  const handleClick=(username:string) => {
    if (username.length > 0){ 
      setUser(username)
    }

  }
  return(
    <>
    <div className='flex flex-col items-center justify-center'>
     <input className="bg-gray-50border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 w-100 mt-40 p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 required:border-red-500" placeholder="username" onChange={(e:any)=>setUsername(e.target.value)}>
      </input>

    <button className="bg-blue-500 rounded w-40 h-12 m-4 text-white shadow-lg hover:bg-blue-600" onClick={()=>handleClick(username)}>Ready</button>
    </div>
    </>
  )
}