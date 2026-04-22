let taskInput = document.getElementById("taskInput");
let dateInput = document.getElementById("dateInput");
let priority = document.querySelectorAll(".priority-btns button");
let addBtn = document.getElementById("add-btn");
let tasks = document.querySelector(".tasks");
let myNotification = document.querySelector(".notification");
let myNotificationContent = document.querySelector(".notification p");
let myNotificationIcon = document.querySelector(".notification i");
let body = document.querySelector("body")


// Load tasks from LocalStorage
let taskArr = JSON.parse(localStorage.getItem("tasks")) || [];

/* ------------------------------------------
   PRIORITY SELECTION
------------------------------------------- */
let priorityVal = "";

priority.forEach((btn) => {
  btn.addEventListener("click", () => {
    priority.forEach((b) => b.classList.remove("active"));
    priorityVal = btn.lastElementChild.textContent;
    btn.classList.add("active");
  });
});
/* ------------------------------------------
   SET COLOR TO PRIORITY FUNCTION
------------------------------------------- */
function setColorToPriority(taskElement) {
  const prioritySpan = taskElement.querySelector(".task-priority span");
  const priorityDiv = taskElement.querySelector(".task-priority");

  // Remove old classes
  priorityDiv.classList.remove("priority-high", "priority-medium", "priority-low");

  if (prioritySpan.textContent === "High") {
    priorityDiv.classList.add("priority-high");
  } else if (prioritySpan.textContent === "Medium") {
    priorityDiv.classList.add("priority-medium");
  } else {
    priorityDiv.classList.add("priority-low");
  }
}
/* ------------------------------------------
   NOTIFICATION FUNCTION
------------------------------------------- */
function notification(content,notificationStyleClass="",roundedIconClass = "",icon = "fa-regular fa-circle-check") {
  // colors
  // myNotification.style.backgroundColor = bgColor;
  // myNotification.style.borderColor = borderColor;

  // reset icon HTML
  myNotificationIcon.className = "";
  myNotificationIcon.innerHTML = "";

  // add style class (successfully-add,successfully-delete,successfully-edit)
  if (notificationStyleClass !== "") {
    myNotification.classList.add(notificationStyleClass);
  }

  // add optional style class (roundedIcon)
  if (roundedIconClass !== "") {
    myNotificationIcon.classList.add(roundedIconClass);
  }

  // insert icon inside the container
  myNotificationIcon.innerHTML = `<i class="fa ${icon}"></i>`;

  // content
  myNotificationContent.textContent = content;

  // show
  myNotification.style.display = "flex";

  setTimeout(() => (myNotification.style.animationName = "moveToLeft"), 2500);
  setTimeout(() => (myNotification.style.display = "none"), 5000);

  myNotification.style.animationName = "moveToRight";
}

/* ------------------------------------------
   ADD TASK
------------------------------------------- */
addBtn.addEventListener("click", (e) => {
  e.preventDefault();

  let task = taskInput.value;
  let date = dateInput.value;
  if (task.trim() === "" || date.trim() === "" || priorityVal === "") {
    notification("Please fill all fields!","#962E2A","roundedIcon","fa fa-exclamation");
    return;
  }
  let newTask = {
    id: Date.now(),
    task: task,
    date: date,
    priority: priorityVal,
    completed: false,
  };

  taskArr.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskArr));

  // Hide no tasks message if visible
  const noTasksEl = document.querySelector(".no-tasks");
  if (noTasksEl && taskArr.length > 0) {
    noTasksEl.style.display = "none";
  }

  renderTask(newTask);

  taskInput.value = "";
  dateInput.value = "";
  priorityVal = "";
  priority.forEach((b) => b.classList.remove("active"));

  totalTasks();
  totalOfActiveTasks()

    notification("Task added successfully!","successfully-add");
  
});

//  ------------------ Add Button Opacity --------------------
taskInput.addEventListener("input", (e) => {
  let taskInp = taskInput.value

  if(taskInp.length>0){
    addBtn.style.opacity="1"
  }else{
    addBtn.style.opacity=".5"
  }
})

//    ------------------- expanded-area ----------------------
let expanded = document.querySelector(".expanded-area");

taskInput.addEventListener("click", () => {
  expanded.classList.add("show");
});
//   -------------------- Show Date Picker --------------------

dateInput.addEventListener('click', () => {
  dateInput.showPicker();
});
/* ------------------------------------------
   RENDER ALL TASKS FUNCTION
------------------------------------------- */
function renderAllTasks(list) {
  tasks.innerHTML = "";
  list.forEach((task) => renderTask(task));
}
/* ------------------------------------------
   RENDER TASK (WITH DISABLED EDIT BTN IF COMPLETED)
------------------------------------------- */
function renderTask(taskObj) {
  let myTask = document.createElement("div");
  myTask.classList.add("task");
  myTask.dataset.id = taskObj.id;
  myTask.dataset.date = taskObj.date;
  myTask.dataset.priority = taskObj.priority;

  myTask.innerHTML = `
    <div>
      <input type="checkbox" ${taskObj.completed ? "checked" : ""}>
      <div class="task-content-container">
        <p class="task-content">${taskObj.task}</p>

        <div class="date-and-priority">
          <div class="task-date">
            <i class="fa-regular fa-calendar"></i> 
            <span>${taskObj.date}</span>
          </div>

          <div class="task-priority">
            <i class="fa-solid fa-angle-down"></i> 
            <span>${taskObj.priority}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="task-btns">
      <div class="edit-btn"><i class="fa-regular fa-pen-to-square"></i></div>
      <div class="delete-btn"><i class="fa-regular fa-trash-can"></i></div>
    </div>
  `;

  // Apply completed styles
  if (taskObj.completed) {
    myTask.querySelector(".task-content").style.textDecoration = "line-through";
    myTask.style.opacity = ".5";
  }

  updateEditButton(myTask, taskObj.completed);

  // Set priority color
  setColorToPriority(myTask);

  tasks.prepend(myTask);
}


// Render old tasks
renderAllTasks(taskArr);

/* ------------------------------------------
   COMPLETED TASK (with Event Delegation)
------------------------------------------- */
tasks.addEventListener("change", (e) => {
  // Check if the change happened on a checkbox inside a task
  if (e.target.matches("[type='checkbox']")) {
    let taskDiv = e.target.closest(".task"); // Get the task div
    let myDataId = Number(taskDiv.dataset.id); // Get the task id
    let taskContent = taskDiv.querySelector(".task-content"); // Get the task text

    // Update the completed status in the array
    taskArr.forEach((task) => {
      if (task.id === myDataId) {
        task.completed = e.target.checked;
        // Apply styles immediately
        taskContent.style.textDecoration = task.completed
          ? "line-through"
          : "none";
        taskDiv.style.opacity = task.completed ? ".5" : "1";
        updateEditButton(taskDiv, task.completed);
      }
    });
    totalOfActiveTasks()
    totalOfCompletedTasks()
    // Update LocalStorage
    localStorage.setItem("tasks", JSON.stringify(taskArr));
  }
});
/* ------------------------------------------
   Function to update edit button based on completion
------------------------------------------- */
function updateEditButton(taskDiv, isCompleted) {
  const editBtn = taskDiv.querySelector(".edit-btn");
  if (isCompleted) {
    editBtn.classList.add("disabled");
    editBtn.style.pointerEvents = "none";
    editBtn.style.opacity = ".5";
    editBtn.setAttribute("title", "Cannot edit a completed task");
  } else {
    editBtn.classList.remove("disabled");
    editBtn.style.pointerEvents = "auto";
    editBtn.style.opacity = "1";
    editBtn.removeAttribute("title");
  }
}

/* ------------------------------------------
   DELETE TASK
------------------------------------------- */
tasks.addEventListener("click", (e) => {
  let deleteBtn = e.target.closest(".delete-btn");
  if (!deleteBtn) return;

  let taskDiv = deleteBtn.closest(".task");
  let id = taskDiv.dataset.id;

  taskDiv.remove();

  taskArr = taskArr.filter((task) => task.id != id);
  localStorage.setItem("tasks", JSON.stringify(taskArr));

  // Show no tasks message if array is empty
  taskArr.length == 0?document.querySelector(".no-tasks").style.display="flex":''

  notification("Task deleted successfully!","successfully-delete","roundedIcon","fa fa-exclamation"); 

  totalTasks()
  totalOfActiveTasks()
});

/* ------------------------------------------
   EDIT TASK
------------------------------------------- */
tasks.addEventListener("click", (e) => {
  let editBtn = e.target.closest(".edit-btn");
  if (!editBtn) return;

  let taskDiv = editBtn.closest(".task");
  if (taskDiv.querySelector("input[type='checkbox']").checked) {
  return;
}
  let id = Number(taskDiv.dataset.id);

  let originalText = taskDiv.querySelector(".task-content").textContent;
  let originalDate = taskDiv.dataset.date;
  let originalPriority = taskDiv.dataset.priority;

  /* ---------- CREATE MODAL ---------- */
  let modal = document.createElement("div");
  modal.classList.add("modal");
  modal.id = id;

  modal.innerHTML = `
    <div class="modal-content">
      <input type="text" class="edit-text" value="${originalText}" />

      <div>
              <div class="priority">
          <div class="priority-btns">
            <button><span>High</span></button>
            <button><span>Medium</span></button>
            <button><span>Low</span></button>
          </div>
        </div>
        <input type="date" class="edit-date" value="${originalDate}" />


      </div>

      <div class="modal-btn">
        <div class="cancel-btn">Cancel</div>
        <div class="save-btn">Save</div>
      </div>
    </div>
  `;

  taskDiv.appendChild(modal);
  modal.style.display = "block";

  

  /* ---------- Close modal ---------- */
    modal.querySelector(".cancel-btn").addEventListener("click", () => {
    modal.remove();
  });

  /* ---------- Priority Selection Inside Modal ---------- */
  let modalPriorityBtns = modal.querySelectorAll(".priority-btns button");

  modalPriorityBtns.forEach((btn) => {
    if (btn.textContent.trim() === originalPriority)
      btn.classList.add("active");

    btn.addEventListener("click", () => {
      modalPriorityBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  /* ---------- SAVE EDIT ---------- */
  modal.querySelector(".save-btn").addEventListener("click", () => {
    let newText = modal.querySelector(".edit-text").value;
    let newDate = modal.querySelector(".edit-date").value;
    let newPriority = modal.querySelector(
      ".priority-btns button.active span"
    ).textContent;

    // Update UI (safe)
    taskDiv.querySelector(".task-content").textContent = newText;
    taskDiv.querySelector(".task-date span").textContent = newDate;
    taskDiv.querySelector(".task-priority span").textContent = newPriority;

    // Update Dataset
    taskDiv.dataset.date = newDate;
    taskDiv.dataset.priority = newPriority;

    // Update LocalStorage
    let current = taskArr.find((t) => t.id === id);
    current.task = newText;
    current.date = newDate;
    current.priority = newPriority;

    setColorToPriority(taskDiv)

    localStorage.setItem("tasks", JSON.stringify(taskArr));


    notification("Task updated successfully!","successfully-edit");

    modal.remove();
  });
});
/* ------------------------------------------
   AUTO SEARCH TASK 
------------------------------------------- */
let searchInput = document.querySelector("[type='search']");

searchInput.addEventListener("input", () => {
  let searchValue = searchInput.value.toLowerCase().trim();

  let searchResult = taskArr.filter((task) =>
    task.task.toLowerCase().includes(searchValue)
  );

  if (searchValue === "") {
    renderAllTasks(taskArr);
    return;
  }

 renderAllTasks(searchResult);
});
/* ------------------------------------------
   ORDER FILTER TASK 
------------------------------------------- */
let orderFilter = document.querySelector("#orderFilter");

orderFilter.addEventListener("change", (e) => {
  let filterVal = e.target.value;

  if (filterVal === "newest") {
    taskArr.sort((a, b) => b.id - a.id);
  } else if (filterVal === "oldest") {
    taskArr.sort((a, b) => a.id - b.id);
  } else if (filterVal === "priority-high") {
    const priorityValue = { High: 3, Medium: 2, Low: 1 };
    taskArr.sort(
      (a, b) => priorityValue[b.priority] - priorityValue[a.priority]
    );
  } else if (filterVal === "priority-low") {
    const priorityValue = { High: 3, Medium: 2, Low: 1 };
    taskArr.sort(
      (a, b) => priorityValue[a.priority] - priorityValue[b.priority]
    );
  }
  renderAllTasks(taskArr);
});
/* ------------------------------------------
    STATUS FILTERING TASKS
------------------------------------------- */
let statusTaskFiltering = document.querySelector("#taskFilter")
statusTaskFiltering.addEventListener(("change"),e=>{
  let statusFilterValue = e.target.value
  let filteredTasks = []
  if (statusFilterValue === "active") {
    filteredTasks = taskArr.filter((task) => task.completed === false);
  } else if (statusFilterValue === "completed") {
    filteredTasks = taskArr.filter((task) => task.completed === true);
  } else {
    filteredTasks = taskArr;
  }
  renderAllTasks(filteredTasks);
})
/* ------------------------------------------
   Statistics TASKS FUNCTION 
------------------------------------------- */

function totalOfActiveTasks() {
  const numOfActiveTasks = document.querySelector(".active-tasks");
  const count = taskArr.filter(t => t.completed === false).length;
  numOfActiveTasks.textContent = `${count} Active`;
}

function totalOfCompletedTasks() {
  const numOfCompletedTasks = document.querySelector(".completed-tasks");
  const count = taskArr.filter(t => t.completed).length;
  numOfCompletedTasks.textContent = `${count} Completed`;
}

function totalTasks() {
  let numOfTotalTasks = document.querySelector(".total-tasks");
  numOfTotalTasks.textContent = `${taskArr.length} total`;
}


/* ------------------------------------------*/



window.onload = function () {
  totalOfActiveTasks();
  totalOfCompletedTasks();
  totalTasks();
};

/* ------------------------------------------
    DARK AND NIGHT MODE FUNCTION 
------------------------------------------- */

let mode = document.querySelector(".mode");

mode.addEventListener("click", () => {
  body.classList.toggle("light-mode");

  if (body.classList.contains("light-mode")) {
    body.classList.remove("dark-mode");
    localStorage.setItem("mode", "light-mode");
  } else {
    body.classList.add("dark-mode");
    localStorage.setItem("mode", "dark-mode");
  }
});