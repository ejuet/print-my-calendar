import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Upload File</h1>
      <input type="file" accept='ics' multiple onChange={(e) => {

        var files = e.target.files;
        for (let i = 0; i < files.length; i++) {
          
          let fr = new FileReader();
          fr.onload = function () {
            console.log(fr.result);
          }
          fr.readAsText(files[i]);
        }
      }}></input>
    </div>
  );
}

export default App;
