type Props ={
  children: React.ReactNode
}


export default function Layout({children}: Props){
  return(
    <div className="bg-grey h-screen">
      {children}

    </div>
  )
}