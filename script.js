let API_KEY = "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";

const API_URL = "https://api.openai.com/v1/chat/completions";

const buttonBar = document.getElementById("button-bar");

var redo_manager_disabled = false;

var _jm = null;
const {jsPDF} = window.jspdf;
// console.log(jsPDF);


function showpSpinner() {
  const button = document.getElementById("pdfdownload");
  button.innerHTML = '<i class="fas fa-spinner fa-spin fa-lg"></i>';
}

function hidepSpinner() {
  const button = document.getElementById("pdfdownload");
  button.innerHTML = '  <i class="ri-download-2-fill"></i>';
}

function showssSpinner() {
  const button = document.getElementById("screenshot");
  button.innerHTML = '<i class="fas fa-spinner fa-spin fa-lg"></i>';
}

function hidessSpinner() {
  const button = document.getElementById("screenshot");
  button.innerHTML = ' <i class="ri-screenshot-2-line"></i>';
}



async function captureScreenshot() {
  try {
    showpSpinner()
    var mind_data = _jm.get_data();
  
   console.log(mind_data)
    delete mind_data.data.chatlog;
    const container = await document.getElementById("jsmind_container");
     
    const containerHeight = container.children[0].children[0].clientHeight;
    const containerWidth = container.children[0].children[0].clientWidth;
    console.log(
      container.children[0].children[0].clientHeight,
      container.children[0].children[0].clientWidth
    );

    // Set the height of the container to its scrollHeight to include all components
    container.style.height = `${container.children[0].children[0].clientHeight}px`;
    container.style.width = `${container.children[0].children[0].clientWidth}px`;

    // Wait for a short delay to ensure proper rendering (adjust the delay as needed)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Capture the screenshot of the element using html2canvas
    const canvas = await html2canvas(container, {
      scrollY: -window.scrollY,
      useCORS: true,
    });

    // Reset the height of the container to its original value
    container.style.height = "";
    container.style.width = "";

  

    // Convert the canvas to an image URL
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();

    const ratio = containerWidth / containerHeight;
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = pdfWidth / ratio;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    // Save the PDF
    await pdf.save(`${mind_data.data.topic }.pdf`);
    hidepSpinner();

    // Create a temporary anchor element to trigger the download
    // const downloadLink = document.createElement("a");
    // downloadLink.href = imgData;
    // downloadLink.download = `mind_map_screenshot.png`;
    // downloadLink.click();
  } catch (error) {
    console.error("Error capturing the screenshot:", error);
  }
}

function showhoverdiv (){
  try {
    var mind_data = _jm.get_data();
  
    console.log(mind_data);

  } catch (error) {
    
  }
}

function clearAllMindMaps() {
  console.log("delete");
  var rootNode = _jm.get_node("root");
  var childNodes = rootNode.children.slice();

  for (var i = 0; i < childNodes.length; i++) {
    _jm.remove_node(childNodes[i].id);
  }

  redo_manager_disabled = false;
}

async function autoSaveData() {
  var data = _jm.get_data();
  if (!redo_manager_disabled) {
    console.log("autoSaveData performAction");
    undoRedoManager.performAction(data);
  }
  document.title = data.data.topic;
  recordSettings(data);
  await saveData(dbName, data);
}

function undo() {
  const repeat = undoRedoManager.undo(_jm.get_data());
  console.log(repeat);
  if (repeat != null) {
    _jm.show(repeat);
  }
}

function redo() {
  const repeat = undoRedoManager.redo();
  if (repeat != null) {
    _jm.show(repeat);
  }
}

var zoomInButton = document.getElementById("zoom-in-button");
var zoomOutButton = document.getElementById("zoom-out-button");

function zoomIn() {
  if (_jm.view.zoomIn()) {
    zoomOutButton.disabled = false;
  } else {
    zoomInButton.disabled = true;
  }
}

function zoomOut() {
  if (_jm.view.zoomOut()) {
    zoomInButton.disabled = false;
  } else {
    zoomOutButton.disabled = true;
  }
}

function expand() {
  _jm.expand();
}

function collapse() {
  _jm.collapse();
}

function open_file(event) {
  var files = document.getElementById("file_input").files;
  console.log(files);
  if (_jm.get_data().data.children && _jm.get_data().data.children.length > 0) {
    prompt_info("Please start with an empty mindmap before loading from disk.");
    event.target.value = null;
    return;
  }
  if (files.length > 0) {
    var file_data = files[0];
    jsMind.util.file.read(file_data, function (jsmind_data, jsmind_name) {
      var mind = jsMind.util.json.string2json(jsmind_data);
      if (!!mind) {
        _jm.show(mind);
        load_meta_properties(mind);
      } else {
        prompt_info("can not open this file as mindmap");
      }
    });
  } else {
    prompt_info("please choose a file first");
  }
  event.target.value = null;
}

document.getElementById("file_input").addEventListener("change", open_file);

buttonBar.addEventListener("mousedown", (event) => {
  const offsetX = event.clientX - buttonBar.getBoundingClientRect().left;
  const offsetY = buttonBar.getBoundingClientRect().bottom;
  const onMouseMove = (event) => {
    buttonBar.style.left = `${event.clientX - offsetX}px`;
    buttonBar.style.bottom = `${offsetY - event.clientY}px`;
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
});

function showSpinner() {
  const button = document.getElementById("add-node-button");
  button.innerHTML = '<i class="fas fa-spinner fa-spin fa-lg"></i>';
}

function hideSpinner() {
  const button = document.getElementById("add-node-button");
  button.innerHTML = '<i class="ri-git-branch-line"></i>';
}

function getParameterFromUrl(paramName) {
  try {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return urlSearchParams.get(paramName);
  } catch (error) {
    return null;
  }
}

let dbName = getParameterFromUrl("map");
if (dbName == null) {
  dbName = "default";
}

async function openDatabase(dbName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore("dataStore", { keyPath: "id" });
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

async function loadData(dbName, defaultValue) {
  try {
    const db = await openDatabase(dbName);
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["dataStore"], "readonly");
      const objectStore = transaction.objectStore("dataStore");
      const request = objectStore.get(1);

      request.onsuccess = (event) => {
        const data = event.target.result;
        resolve(data ? data.value : defaultValue);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

async function saveData(dbName, data) {
  try {
    const db = await openDatabase(dbName);
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["dataStore"], "readwrite");
      const objectStore = transaction.objectStore("dataStore");
      const request = objectStore.put({ id: 1, value: data });

      request.onsuccess = (event) => {
        resolve();
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

function openSettings() {
  document.getElementById("settings-popup").classList.remove("hidden");
}

function closeSettingsPopup() {
  console.log("close");
  document.getElementById("settings-popup").classList.add("hidden");
  autoSaveData();
}

async function chatGPTRequest(prompt, curNode = null) {
  try {
    gptEngine = document.getElementById("gpt-engine").value;
    maxTokens = 4096; //document.getElementById("max-tokens").value;
    temperature = parseFloat(document.getElementById("temperature").value);
    if (isNaN(temperature)) {
      temperature = 0.3;
    }
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: gptEngine,
        messages: [{ role: "user", content: prompt }],
        temperature: temperature,
      }),
    });
    if (!response.ok) {
      console.log(response);
      prompt_info(
        "Error communication with OpenAI API:" +
          response.status +
          " 401 means that your API Key is incorrect."
      );
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.log("chatGPTRequest", data);
    addTokenUsage(data.usage.total_tokens);
    const resp = data.choices[0].message.content;
    if (curNode) {
      dict = curNode.data;
      if (!dict.hasOwnProperty("chatlog")) {
        dict["chatlog"] = "";
      }

      dict["chatlog"] += "user-message:\n" + prompt + "\n";
      dict["chatlog"] += "gpt-message:\n" + resp + "\n\n";
      _jm.set_node_color(curNode.id, "#FFA533", null);
      await autoSaveData();
    }

    return resp;
  } catch (error) {
    console.error("Error:", error);
  }
}

function get_def_options() {
  var def_options = {
    container: "jsmind_container",
    theme: "nephrite",
    editable: true,
    support_html: false,
    view: {
      node_overflow: "wrap",
      engine: "svg",
      draggable: true,
      line_width: 10,
    },

    layout: {
      hspace: 40,
      vspace: 10,
      pspace: 20,
    },
  };
  return def_options;
}

// function get_def_mind() {
//   var mind = {
//     meta: {
//       name: "Mw Futuretech", // Replace "YourNameHere" with your desired name
//       author: "futureTech", // You can change the author field too if needed
//       version: "1.0",
//     },

//     format: "node_tree",
//     data: {
//       id: "root",
//       topic: "MWFutureTech",
//     },
//   };
//   return mind;
// }

// function create_mindmap() {
//   var options = {
//     container: "jsmind_container",
//     editable: true,
//     theme: "primary",
//   };

//   var mind = get_def_mind();

//   // Change the name property of the mind object
//   mind.name = "Mw FutureTech";

//   _jm = jsMind.show(options, mind);

//   // Set up event listeners for mindmap events
//   _jm.add_event_listener(jsMind.event_type.resize, on_resize);
//   _jm.add_event_listener(jsMind.event_type.edit, on_edit);
//   _jm.add_event_listener(jsMind.event_type.select_node, on_select_node);
//   _jm.add_event_listener(jsMind.event_type.unselect_node, on_unselect_node);
//   _jm.add_event_listener(jsMind.event_type.click_canvas, on_click_canvas);
// }

function get_def_mind() {
  var mind = {
    meta: {
      name: "Mw FutureTech",
      author: "futureTech",
      version: "1.0",
    },
    format: "node_tree",
    data: {
      id: "root",
      topic: "Mw futuretech", // Change this to your desired name
      // expanded: true,
      // chatlog: "user-message:\nI am creating a mindmap.  Here is wh…re and expand upon these ideas in your mindmap!\n\n",
      // "background-color": "#FFA533",
    },
  };
  return mind;
}

function create_mindmap() {
  var options = {
    container: "jsmind_container",
    editable: true,
    theme: "primary",
  };

  var mind = get_def_mind();
  _jm = jsMind.show(options, mind);

  // Set up event listeners for mindmap events
  _jm.add_event_listener(jsMind.event_type.resize, on_resize);
  _jm.add_event_listener(jsMind.event_type.edit, on_edit);
  _jm.add_event_listener(jsMind.event_type.select_node, on_select_node);
  _jm.add_event_listener(jsMind.event_type.unselect_node, on_unselect_node);
  _jm.add_event_listener(jsMind.event_type.click_canvas, on_click_canvas);
}

// function save() {
//   var mind_data = _jm.get_data();
//   delete mind_data.data.chatlog;
//   // Update the meta object with the desired name
//   mind_data.meta.name = "MW FutureTech"; // Change "Your Desired Name" to your desired name
//   var mind_topic = mind_data.data.topic;

//   var mind_name = mind_data.meta.name; // Get the updated name from meta.name

//   var simplified_mind = {
//     meta: {
//       name: mind_data.meta.name,
//     },
//     format: mind_data.format,
//     data: {
//       id: mind_data.data.id,
//       topic: mind_data.data.topic,
//       expanded: mind_data.data.expanded,
//       "background-color": mind_data.data["background-color"],
//       children: mind_data.data.children,
//     },
//   };

//   var mind_str = jsMind.util.json.json2string(simplified_mind);
//   console.log(mind_name);
//   jsMind.util.file.save(mind_str, "text/jsmind", mind_topic  + ".txt");
// }

async function save() {
  try {
    showssSpinner();
    var mind_data = _jm.get_data();
  
   
    delete mind_data.data.chatlog;
    const container = await document.getElementById("jsmind_container");

    const containerHeight = container.children[0].children[0].clientHeight;
    const containerWidth = container.children[0].children[0].clientWidth;
    console.log(
      container.children[0].children[0].clientHeight,
      container.children[0].children[0].clientWidth
    );

    // Set the height of the container to its scrollHeight to include all components
    container.style.height = `${container.children[0].children[0].clientHeight}px`;
    container.style.width = `${container.children[0].children[0].clientWidth}px`;

    // Wait for a short delay to ensure proper rendering (adjust the delay as needed)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Capture the screenshot of the element using html2canvas
    const canvas = await html2canvas(container, {
      scrollY: -window.scrollY,
      useCORS: true,
    });

    // Reset the height of the container to its original value
    container.style.height = "";
    container.style.width = "";

    // Convert the canvas to an image URL
    const imgData = canvas.toDataURL("image/png");
    // Create a temporary anchor element to trigger the download
    const downloadLink = document.createElement("a");
    downloadLink.href = imgData;
  downloadLink.download = mind_data.data.topic + ".png";
   await  downloadLink.click();
   hidessSpinner();
  } catch (error) {
    console.error("Error capturing the screenshot:", error);
  }


  
}

// const mindMapContainer = document.getElementById("jsmind_container");
// const offscreenContainer = document.getElementById("offscreen_container");

// document.addEventListener("DOMContentLoaded", function () {
// const getZoom = () => {
//   // Get the current scale transform of the container
//   const transformStyle = window.getComputedStyle(mindMapContainer).transform;
//   const matrix = transformStyle.match(/matrix\(([^\)]+)\)/i);
//   if (matrix) {
//     const transformValues = matrix[1].split(", ");
//     if (transformValues.length === 6) {
//       const scaleX = parseFloat(transformValues[0]);
//       const scaleY = parseFloat(transformValues[3]);
//       return { scaleX, scaleY };
//     }
//   }
//   return { scaleX: 1, scaleY: 1 };
// };

// const copyMindMapToOffscreen = () => {
//   const { scaleX, scaleY } = getZoom();

//   // Calculate the scaled dimensions based on zoom level
//   const scaledWidth = mindMapContainer.scrollWidth * scaleX;
//   const scaledHeight = mindMapContainer.scrollHeight * scaleY;

//   // Copy the mind map elements to the off-screen container
//   offscreenContainer.innerHTML = mindMapContainer.innerHTML;

//   // Adjust the off-screen container size to fit the entire mind map
//   offscreenContainer.style.width = scaledWidth + "px";
//   offscreenContainer.style.height = scaledHeight + "px";

//   // Adjust the off-screen container's scroll position to match the original container
//   const scrollLeft = mindMapContainer.scrollLeft * scaleX;
//   const scrollTop = mindMapContainer.scrollTop * scaleY;
//   offscreenContainer.scrollTo(scrollLeft, scrollTop);
// };

// const captureMindMap = () => {
//   copyMindMapToOffscreen();

//   // Use html2canvas library to render the off-screen container onto the canvas
//   html2canvas(offscreenContainer).then((canvas) => {
//     // Convert canvas to data URL and create a download link for the captured image
//     const dataUrl = canvas.toDataURL();
//     const downloadLink = document.createElement("a");
//     downloadLink.href = dataUrl;
//     downloadLink.download = "mindmap_screenshot.png";

//     // Trigger the download
//     downloadLink.click();
//   });
// };

// document.getElementById("captureBtn").addEventListener("click", captureMindMap);
// document.getElementById("zoom-in-button").addEventListener("click", zoomIn);
// document.getElementById("zoom-out-button").addEventListener("click", zoomOut);
// })

function init_jm(def_options, options) {
  def_options.view.line_width = 3;
  _jm = new jsMind(def_options);
  patch_jm(_jm);
  console.log("open_empty 1", _jm.options);
  _jm.show(options);
  console.log("open_empty 2", _jm.options);

  load_meta_properties(options);
  _jm.add_event_listener(async function (type, data) {
    if (
      ["update_node", "expand_node", "collapse_node", "remove_node"].includes(
        data.evt
      )
    ) {
      await autoSaveData();
    } else {
      console.log("event", data);
      // const min = document.(data.node)
      // console.log(min)
    }
  });
  return _jm;
}

function patch_jm(_jm) {
  _jm.layout._layout_offset_subnodes = function (nodes) {
    var total_height = 0;
    var nodes_count = nodes.length;
    var i = nodes_count;
    var node = null;
    var node_outer_height = 0;
    var layout_data = null;
    var base_y = 0;
    var pd = null; // parent._data
    while (i--) {
      node = nodes[i];
      layout_data = node._data.layout;
      if (pd == null) {
        pd = node.parent._data;
      }

      node_outer_height = this._layout_offset_subnodes(node.children);
      if (!node.expanded) {
        node_outer_height = 0;
        this.set_visible(node.children, false);
      }
      node_outer_height = Math.max(node._data.view.height, node_outer_height);

      layout_data.outer_height = node_outer_height;
      layout_data.offset_y = base_y - node_outer_height / 2;
      layout_data.offset_x =
        this.opts.hspace * layout_data.direction +
        (pd.view.width * (pd.layout.direction + layout_data.direction)) / 2;
      if (!node.parent.isroot) {
        layout_data.offset_x += this.opts.pspace * layout_data.direction;
      }

      base_y = base_y - node_outer_height - this.opts.vspace;
      total_height += node_outer_height;
    }
    if (nodes_count > 1) {
      total_height += this.opts.vspace * (nodes_count - 1);
    }
    i = nodes_count;
    var middle_height = total_height / 2;
    while (i--) {
      node = nodes[i];
      node._data.layout.offset_y += middle_height;
    }
    return total_height + 10;
  };

  _jm.layout._layout_offset_subnodes_height = function (nodes) {
    var total_height = 0;
    var nodes_count = nodes.length;
    var i = nodes_count;
    var node = null;
    var node_outer_height = 0;
    var layout_data = null;
    var base_y = 0;
    var pd = null; // parent._data
    while (i--) {
      node = nodes[i];
      layout_data = node._data.layout;
      if (pd == null) {
        pd = node.parent._data;
      }

      node_outer_height = this._layout_offset_subnodes_height(node.children);
      if (!node.expanded) {
        node_outer_height = 0;
      }
      node_outer_height = Math.max(node._data.view.height, node_outer_height);

      layout_data.outer_height = node_outer_height;
      layout_data.offset_y = base_y - node_outer_height / 2;
      base_y = base_y - node_outer_height - this.opts.vspace;
      total_height += node_outer_height;
    }
    if (nodes_count > 1) {
      total_height += this.opts.vspace * (nodes_count - 1);
    }
    i = nodes_count;
    var middle_height = total_height / 2;
    while (i--) {
      node = nodes[i];
      node._data.layout.offset_y += middle_height;
    }
    console.log("layout", total_height);
    return total_height + 10;
  };
}

function get_selected_nodeid() {
  var selected_node = _jm.get_selected_node();

  if (!!selected_node) {
    return selected_node.id;
  } else {
    return null;
  }
}

function createHyphenatedList(node, depth = 0) {
  let result = "";
  let prefix = " ".repeat(depth * 2);
  result += `${prefix}- ${node.topic}\n`;
  if (!node.expanded) return result;

  if (node.children) {
    for (const child of node.children) {
      result += createHyphenatedList(child, depth + 1);
    }
  }

  return result;
}

function secureEvaluateTemplate(template, context) {
  return template.replace(/\$\{(\w+)\}/g, (_, variable) => {
    return context[variable] || "";
  });
}

async function get_children_suggestions(node, _jm, tmpl) {
  const text_of_node = node.topic;
  const hyphenated_list = createHyphenatedList(_jm.get_data().data);
  var prompt = tmpl;
  prompt = secureEvaluateTemplate(prompt, {
    hyphenated_list: hyphenated_list,
    text_of_node: text_of_node,
  });
  console.log(prompt);
  // Make sure you call the chatGPTRequest function with the prompt
  showSpinner();
  const data = await chatGPTRequest(prompt);
  hideSpinner();
  return data;
}
function closeCustomAlert() {
  const customAlert = document.getElementById("custom-alert");
  customAlert.classList.add("hidden");
}

setupPopSizeListener(750, 600, document.getElementById("help-popup"));

function openHelp() {
  document.getElementById("help-popup").classList.remove("hidden");
}

function closeHelp() {
  document.getElementById("help-popup").classList.add("hidden");
}

function processGptResponse(response, selected_node, _jm, do_scroll = true) {
  // Step 1: Extract content between <embed> tags
  const embedContent = response.match(/<embed>([\s\S]*?)<\/embed>/)[1].trim();

  // Step 2: Process the extracted content and build the hierarchy
  const lines = embedContent.split("\n");
  const hierarchy = [];

  for (const line of lines) {
    const level = line.search(/\S/);
    const content = line.trim().replace(/^-/, "").trim();

    hierarchy.push({
      level: level / 2,
      content: content,
      id: jsMind.util.uuid.newid(),
    });
  }

  console.log(hierarchy);
  // Step 3: Add nodes to jsMind with the correct connections
  for (let i = 0; i < hierarchy.length; i++) {
    const currentNode = hierarchy[i];
    let parentId = selected_node;

    if (currentNode.level > 0) {
      for (let j = i - 1; j >= 0; j--) {
        if (hierarchy[j].level === currentNode.level - 1) {
          parentId = hierarchy[j].id;
          break;
        }
      }
    }

    nd = _jm.add_node(parentId, currentNode.id, currentNode.content);
    console.log(nd);
    if (do_scroll) {
      nd._data.view.element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }
}

async function add() {
  var selected_node = _jm.get_selected_node(); // as parent of new node
  if (!selected_node) {
    prompt_info("please select a node first.");
    return;
  }

  // Call get_children_suggestions function and wait for the response
  const response = await get_children_suggestions(
    selected_node,
    _jm,
    document.getElementById("child-node-suggestion").value
  );
  console.log(response);
  // Call processGptResponse function to process the response and add nodes
  console.log("add_node redo_manager true");
  redo_manager_disabled = true;
  processGptResponse(response, selected_node, _jm);
  console.log("add_node redo_manager false");
  setTimeout(async () => {
    redo_manager_disabled = false;
    await autoSaveData();
  }, 1000);
}

async function restructure() {
  var selected_node = _jm.get_root();
  const response = await get_children_suggestions(
    selected_node,
    _jm,
    document.getElementById("restructure-prompt").value
  );
  const def_options = get_def_options();
  const mind = get_def_mind();
  _jm = init_jm(def_options, mind);
  var selected_node = _jm.get_root();

  console.log(response);

  processGptResponse(response, selected_node, _jm);
}

async function open_empty() {
  const def_options = get_def_options();
  const mind = get_def_mind();
  const options = await loadData(dbName, mind);
  console.log("open_empty performAction");
  undoRedoManager.performAction(options);
  _jm = init_jm(def_options, options);
}

// function save() {
//   var mind_data = _jm.get_data();
//   console.log(_jm)
//   // var mind_data = "MWFT";
//   console.log(mind_data)
//   var mind_name = mind_data.meta.name;
//   var mind_str = jsMind.util.json.json2string(mind_data);
//   console.log(mind_data.meta.name);
//   jsMind.util.file.save(mind_str, "text/jsmind", mind_name + ".txt");
// }

// function save() {
//   var mind_data = _jm.get_data();
//   console.log(mind_data);
//   var mind_name = mind_data.data.topic;
//   var mind_str = jsMind.util.json.json2string(mind_data);
//   console.log(mind_name);
//   jsMind.util.file.save(mind_str, "text/jsmind", mind_name + ".txt");
// }

function prompt_info(msg) {
  showCustomAlert(msg);
}

open_empty();

class UndoRedoManager {
  constructor(maxSize) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxSize = maxSize;
  }

  performAction(state) {
    this.undoStack.push(JSON.parse(JSON.stringify(state)));

    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift();
    }

    this.redoStack = [];
  }

  undo(cur) {
    if (this.undoStack.length === 0) {
      return null;
    }

    var prevState = this.undoStack.pop();
    if (this.undoStack.length === 0) {
      this.undoStack.push(prevState);
    }
    if (prevState == cur) {
      if (this.undoStack.length < 2) {
        return null;
      } else {
        return undo(cur);
      }
    }
    this.redoStack.push(JSON.parse(JSON.stringify(prevState)));
    return prevState;
  }

  redo() {
    if (this.redoStack.length === 0) {
      return null;
    }

    const nextState = this.redoStack.pop();
    this.undoStack.push(JSON.parse(JSON.stringify(nextState)));
    return nextState;
  }
}

function createUpdatePopupSize(maxHeight, maxWidth, div) {
  return function () {
    const windowHeight = window.innerHeight;
    if (windowHeight < maxHeight) {
      div.style.height = windowHeight * 0.9 + "px"; // Set popup height to 80% of the window height
    } else {
      div.style.height = maxHeight;
    }
    const windowWidth = window.innerWidth;
    if (windowWidth < maxWidth) {
      div.style.width = windowWidth * 0.9 + "px"; // Set popup height to 80% of the window height
    } else {
      div.style.width = maxWidth; // Reset the popup height to auto when the window is larger
    }
  };
}

function setupPopSizeListener(maxHeight, maxWidth, popup) {
  const updatePopupSize = createUpdatePopupSize(maxHeight, maxWidth, popup);

  // Call updatePopupHeight on window resize
  window.addEventListener("resize", updatePopupSize);

  // Call updatePopupHeight on page load
  updatePopupSize();
}

const undoRedoManager = new UndoRedoManager(20);

setupPopSizeListener(800, 600, document.getElementById("chat-popup"));

function get_node_discussion_prompt(node, _jm) {
  const text_of_node = node.topic;
  const hyphenated_list = createHyphenatedList(_jm.get_data().data);
  var prompt = document.getElementById("discuss-node-prompt").value;
  prompt = secureEvaluateTemplate(prompt, {
    hyphenated_list: hyphenated_list,
    text_of_node: text_of_node,
  });
  console.log(prompt);
  return prompt;
}

function scrollToBottom() {
  var anchor = document.getElementById("anchor");
  anchor.scrollIntoView({ behavior: "smooth", block: "end" });
}

function observeChatMessages() {
  const chatMessages = document.getElementById("chat-messages");
  const observer = new MutationObserver(scrollToBottom);

  observer.observe(chatMessages, {
    childList: true, // Observe changes to the children of chatMessages
    subtree: true, // Observe changes to the descendants of chatMessages
  });
}

document.addEventListener("DOMContentLoaded", function () {
  observeChatMessages();
});

async function discuss() {
  var selected_node = _jm.get_selected_node(); // as parent of new node
  if (!selected_node) {
    prompt_info("please select a node first.");
    return;
  }

  // Call get_children_suggestions function and wait for the response
  const prompt = get_node_discussion_prompt(selected_node, _jm);
  openChatPopup(selected_node, prompt, _jm);
}
let curNode = null;
let prompt_prefix = "";
async function openChatPopup(_curNode, prompt, _jm) {
  curNode = _curNode;
  backlog = "";
  if (curNode.data.hasOwnProperty("chatlog")) {
    backlog = curNode.data["chatlog"];
  }
  const chatPopup = document.getElementById("chat-popup");
  chatPopup.classList.remove("hidden");

  // Clear existing chat messages
  const chatMessages = document.getElementById("chat-messages");
  chatMessages.innerHTML = "";
  const cur_topic = curNode.topic;
  const hyphenated_list = createHyphenatedList(_jm.get_data().data);
  var prompt_prefix_tmpl = document.getElementById("prefix-prompt").value;
  prompt_prefix = secureEvaluateTemplate(prompt_prefix_tmpl, {
    hyphenated_list: hyphenated_list,
    cur_topic: cur_topic,
  });

  // Display backlog
  if (backlog != "") {
    displayChatMessage(
      "backlog-message",
      "------backlog-----\n" + backlog + "\n----end backlog---"
    );
    displayChatMessage("user-message", "user-message:\n" + prompt_prefix);
  } else {
    // Display prompt
    displayChatMessage("user-message", "user-message:\n" + prompt);

    // Send prompt to GPT and display response
    displayChatMessage(
      "gpt-message",
      "..prompt sent to GPT api, waiting for response.."
    );
    const lastMessage = document.getElementById("chat-messages").lastChild;
    const response = await chatGPTRequest(prompt, curNode);
    lastMessage.innerText = "gpt-message:\n" + response;
  }
  scrollToBottom();
}

function closeChatPopup() {
  const chatPopup = document.getElementById("chat-popup");
  chatPopup.classList.add("hidden");
}

function displayChatMessage(sender, message) {
  const chatMessages = document.getElementById("chat-messages");
  const messageDiv = document.createElement("div");
  messageDiv.className = sender;
  messageDiv.innerText = message;
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}

// Draggable
const chatHeader = document.querySelector(".chat-header");
chatHeader.addEventListener("mousedown", dragMouseDown);

function dragMouseDown(e) {
  e.preventDefault();

  const chatPopup = document.getElementById("chat-popup");
  const offsetX = e.clientX - chatPopup.getBoundingClientRect().left;
  const offsetY = e.clientY - chatPopup.getBoundingClientRect().top;

  document.onmousemove = (e) => {
    chatPopup.style.left = `${e.clientX - offsetX}px`;
    chatPopup.style.top = `${e.clientY - offsetY}px`;
  };

  document.onmouseup = () => {
    document.onmousemove = null;
    document.onmouseup = null;
  };
}

// Resizable
const resizeHandle = document.querySelector(".resize-handle");
resizeHandle.addEventListener("mousedown", resizeMouseDown);

function resizeMouseDown(e) {
  e.preventDefault();

  const chatPopup = document.getElementById("chat-popup");
  const initialWidth = chatPopup.clientWidth;
  const initialHeight = chatPopup.clientHeight;
  const initialX = e.clientX;
  const initialY = e.clientY;

  document.onmousemove = (e) => {
    const newX = e.clientX;
    const newY = e.clientY;

    chatPopup.style.width = `${initialWidth + (newX - initialX)}px`;
    chatPopup.style.height = `${initialHeight + (newY - initialY)}px`;
  };

  document.onmouseup = () => {
    document.onmousemove = null;
    document.onmouseup = null;
  };
}

// Multiline input field and ".." waiting indicator
async function submitChatMessage() {
  const inputText = document.getElementById("chat-input-text");
  const message = inputText.value;
  inputText.value = "";

  if (message.trim() === "") return;

  displayChatMessage("user-message", message);
  displayChatMessage("gpt-message", "..thinking..");
  const lastMessage = document.getElementById("chat-messages").lastChild;
  const response = await chatGPTRequest(prompt_prefix + message, curNode);
  lastMessage.innerText = "gpt-message:\n" + response;
}

setupPopSizeListener(750, 600, document.getElementById("settings-popup"));

function set_theme(theme_name) {
  _jm.set_theme(theme_name);
}

function getValueOrDefault(obj, key, defaultValue) {
  if (!obj.hasOwnProperty(key)) {
    return defaultValue;
  }
  return obj[key];
}

function recordSettings(data) {
  console.log(data);
  // Get the values from the form fields
  data["child-node-suggestion"] = document.getElementById(
    "child-node-suggestion"
  ).value;
  data["discuss-node-prompt"] = document.getElementById(
    "discuss-node-prompt"
  ).value;
  data["prefix-prompt"] = document.getElementById("prefix-prompt").value;
  //data["restructure-prompt"] = document.getElementById("restructure-prompt").value;
  data["gpt-engine"] = document.getElementById("gpt-engine").value;
  data["token-usage"] = document.getElementById("token-usage").textContent;
  data["temperature"] = document.getElementById("temperature").value;
  console.log("recordSettings", data);
}

function addTokenUsage(tokens) {
  value = document.getElementById("token-usage").textContent;
  if (value == "" || isNaN(parseInt(value))) {
    count = 0;
  } else {
    count = parseInt(value);
  }
  console.log("addTokenUsage", value, count, tokens, count + tokens);
  document.getElementById("token-usage").textContent = (
    count + tokens
  ).toString();
}

function saveSettings(event) {
  if (event) event.preventDefault();
  closeSettingsPopup();
}

// Attach the event listener to the form
document
  .getElementById("settings-form")
  .addEventListener("submit", saveSettings);

function load_meta_properties(options) {
  document.getElementById("token-usage").textContent = getValueOrDefault(
    options,
    "token-usage",
    (0).toString()
  );
  document.getElementById("discuss-node-prompt").value = getValueOrDefault(
    options,
    "discuss-node-prompt",
    "I am creating a mindmap.  Here is what's currently visible in the mindmap:\n" +
      "${hyphenated_list}\n" +
      "I'd like to discuss with you about the '${text_of_node}' node.\n" +
      "Respond with your thoughts on:\n" +
      "1. What this node means, both specifically and generally\n" +
      "2. The relevance of this node, how it contributes individually and holistically\n" +
      "3. Where it fits in the mindmap (see the indented listed above)\n" +
      "4. What are some things to consider when adding children, sibling, and parent nodes around it in the mindmap\n" +
      "5. What are some good questions to ask ChatGPT to get a better understanding of this node?\n" +
      "6. And finally, just some novel creative ideas to think about in relation to this node.\n" +
      "When addressing these points, please remember we're talking about the ${text_of_node}' node within the context of the hyphenated mindmap list above."
  );

  document.getElementById("child-node-suggestion").value = getValueOrDefault(
    options,
    "child-node-suggestion",
    "I am creating a mindmap.  Here is what's currently visible:\n" +
      "${hyphenated_list}\n" +
      "I need some ideas for adding at least two child nodes to '${text_of_node}'.\n" +
      "Provide a list of suggestions, in the same hyphenated format above, that would be ideal children of '${text_of_node}', with no empty lines. The list should be prioritized by relevance and importance.\n" +
      "Surround the list of suggestions with <embed></embed>\n" +
      "Do not make suggestions which are redundant to ones already listed above.\n" +
      "Do not repeat ${text_of_node}' in the list.\n" +
      "There must be at least two suggestions for the immediate child nodes of '${text_of_node}'.\n" +
      "Each suggestion must complement, augment, and harmonize with the mindmap listed above.\n"
  );
  document.getElementById("prefix-prompt").value = getValueOrDefault(
    options,
    "prefix-prompt",
    "I am creating a mindmap, here's what's currently visible in the mindmap:\n${hyphenated_list}\nI would like to discuss the '${cur_topic}' node.\n\n"
  );

  /* document.getElementById("restructure-prompt").value = getValueOrDefault(
    options,
    "restructure-prompt",
  "I am creating a mindmap, here's what is currently visible in the mindmap:\n${hyphenated_list}\n"+
  "Restructure the mindmap listed above into a more cohesive, clear, and impactful mindmap.\n"+
      "The restructured mindmap should have many levels, but no less than 3 children and no more than 6 children per item.\n"+
      "Use the same hyphenated hierarchical format above, with no empty lines.\n"+
      "Ensure that the hierarchical hyphenated list is surrounded by <embed></embed>.\n"+
      "Do not include the top level node.\n"
  );*/

  document.getElementById("gpt-engine").value = getValueOrDefault(
    options,
    "gpt-engine",
    "gpt-3.5-turbo"
  );
  document.getElementById("temperature").value = getValueOrDefault(
    options,
    "temperature",
    "0.7"
  );
}

// document.addEventListener("DOMContentLoaded", function () {
//   const apiKeyModal = document.getElementById("api-key-modal");
//   const submitApiKeyButton = document.getElementById("submit-api-key");

//   function showApiKeyModal() {
//     apiKeyModal.style.display = "block";
//   }

//   function hideApiKeyModal() {
//     document.getElementById("api-key-input").value = "";
//     apiKeyModal.style.display = "none";
//   }

//   submitApiKeyButton.addEventListener("click", () => {
//     const apiKeyInput = document.getElementById("api-key-input");
//     API_KEY = apiKeyInput.value.trim(); //This is the only place we 'store' the key
//     const apiKey = API_KEY;
//     if (apiKey) {
//       hideApiKeyModal();
//     } else {
//       showCustomAlert("Please enter a valid API key.");
//     }
//   });

//   // Show the modal dialog on page load.
//   showApiKeyModal();
// });

function showCustomAlert(message) {
  const customAlert = document.getElementById("custom-alert");
  const customAlertMessage = document.getElementById("custom-alert-message");
  customAlertMessage.textContent = message;
  customAlert.classList.remove("hidden");
}


// const hovdiv = document.querySelector(datamip)
// console.log(datamip)

//by saksham

