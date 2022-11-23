type Props = {
  setUser: any;
  setUsername: any;
  username: string;
  setRoomId: any;
  roomId: string;
};
export default function PlayerCreate({
  setUser,
  setUsername,
  username,
}: Props) {
  const handleClick = (username: string) => {
    setUser(username);
  };
  return (
    <>
      <input
        placeholder="username"
        onChange={(e: any) => setUsername(e.target.value)}
      ></input>
      <button onClick={() => handleClick(username)}>
        Submit Username
      </button>
    </>
  );
}
