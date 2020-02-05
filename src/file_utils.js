/* Dealing with the messy details of saving and loading files
 * in the browser by way of stackoverflow copypasta*/

// StackOverflow pasta for a file dialogue
// https://stackoverflow.com/a/43174934
function file_from_input(mime, callback) {
  // this function must be called from a user
  // activation event (ie an onclick event)
  let input = document.createElement("input");
  input.type = "file";
  input.accept = mime;
  input.addEventListener("change", callback)
  input.click();
}

export function upload_json(callback){ 
  file_from_input("text/javascript", (input) =>{
    console.log("in callback");
    let file_reader = new FileReader();
    file_reader.onload = (file) => {
      callback(JSON.parse(file.srcElement.result));
    }
    for(let file of input.target.files){
      // TODO: This wouldn't ever be multiple files, right?
      file_reader.readAsText(file);
    }
  });
}

export function download_json (object, name){
  // https://stackoverflow.com/a/30800715
  let encoded = "data:text/json;charset=utf-8," + encodeURIComponent(
    JSON.stringify(object)
  );
  let virtual_link = document.createElement("a");
  virtual_link.setAttribute("href", encoded);
  virtual_link.setAttribute("download", name + ".json");
  virtual_link.click();
}
