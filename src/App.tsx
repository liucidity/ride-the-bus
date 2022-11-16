import './index.css';
import Button from './components/Button';


function App() {
  return (
    <div className="flex flex-col items-center py-10">
      <h1 className="text-2xl font-bold text-white">
        Bus Riders
      </h1>
      
      <div className='flex flex-row'>
        <img alt='card-back' src="card-back.png" className="h-64"/>
        <img alt='card-back' src="card-back.png" className="h-64"/>
        <img alt='card-back' src="card-back.png" className="h-64"/>
        <img alt='card-back' src="card-back.png" className="h-64"/>
      </div>

      <div>
        Pick an option
      </div>
      <div className='flex flex-row justify-center'>
      <Button option={'Higher'}/>
      <Button option={'Lower'}/>
      </div>
    </div>
  );
}

export default App;
