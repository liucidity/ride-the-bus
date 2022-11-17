type Props ={
  value:string,
  image:string,
  face:boolean
}

export default function Card({value, image, face}: Props) {
  return (
    <div className="m-4">
      {face? 
      <img alt={value} src={image}/>:
      <img className='h-80' alt="card-back" src="blue-card-back.png"/>}
    </div>
  )
}