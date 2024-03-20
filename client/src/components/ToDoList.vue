<template>
  <section class="todoapp">
    <header class="header">
      <h1>todos</h1>
      <h2 v-if="isLoading">Loading...</h2>     
      <input class="new-todo" autofocus autocomplete="off" placeholder="What needs to be done?" v-model="newTodo"
        @keyup.enter="addTodo" />
    </header>
    <section class="main" v-show="todos.length">
      <ul class="todo-list">        
        <li v-for="todo in filteredTodos" class="todo" :key="todo.id" :class="{ completed: todo.completed, editing: todo == editedTodo }" 
          draggable="true" @dragstart="dragStart($event, todo)" @drop="dragDrop($event, todo)" @dragenter="dragEnter($event)" @dragleave="dragLeave($event)" @dragover.prevent>
          <div class="view">
            <input @change="completeTodo(todo)" class="toggle" type="checkbox" v-model="todo.completed" />
            <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
            <button class="destroy" @click="removeTodo(todo)"></button>
          </div>
          <input class="edit" type="text" v-model="todo.title" v-todo-focus="todo == editedTodo" @blur="doneEdit(todo)"
            @keyup.enter="doneEdit(todo)" @keyup.esc="cancelEdit(todo)" />
        </li>
      </ul>
    </section>
    <footer class="footer" v-show="todos.length">
      <span class="todo-count">
        <strong>{{ activeTodos.length }}</strong> {{ pluralize('item', activeTodos.length) }} left
      </span>
      <ul class="filters">
        <li>
          <a href="#/all" @click="visibility = 'all'" :class="{ selected: visibility == 'all' }">All</a>
        </li>
        <li>
          <a href="#/active" @click="visibility = 'active'" :class="{ selected: visibility == 'active' }">Active</a>
        </li>
        <li>
          <a href="#/completed" @click="visibility = 'completed'"
            :class="{ selected: visibility == 'completed' }">Completed</a>
        </li>
      </ul>
      <button class="clear-completed" @click="removeCompleted" v-show="completedTodos.length > 0">
        Clear completed
      </button>
    </footer>
  </section>
  <UserInfo :userDetails="userDetails" />
</template>

<script lang="js">
import UserInfo from './UserInfo.vue'

const API = "/data-api/rest/todo";
const HEADERS = { 'Accept': 'application/json', 'Content-Type': 'application/json;charset=utf-8' };

var filters = {
  all: function (todos) {
    return todos;
  },
  active: function (todos) {
    return todos.filter(todo => { return !todo.completed; });
  },
  completed: function (todos) {
    return todos.filter(todo => { return todo.completed; });
  }
};

export default {
  components: {
    UserInfo
  },

  data() {
    return {
      todos: [],
      newTodo: "",
      editedTodo: null,
      visibility: "all",
      isLoading: false,
      userId: null,
      userDetails: null
    };
  },

  mounted() {
    var visibility = window.location.hash.replace(/#\/?/, "");
    if (filters[visibility]) {
      this.visibility = visibility;
    } else {
      window.location.hash = "";
      this.visibility = "all";
    }

    fetch('/.auth/me')
      .then(res => {
        return res.json()
      })
      .then(payload => {
        const { clientPrincipal } = payload;
        this.userDetails = clientPrincipal?.userDetails;
        this.userId = clientPrincipal?.userId;
      });
    
    this.getTodos();
  },

  computed: {
    activeTodos: function () { return filters["active"](this.todos) },

    completedTodos: function () { return filters["completed"](this.todos) },

    filteredTodos: function () { return (filters[this.visibility](this.todos)).sort(t => t.order); },
  },

  watch: {
    isLoading(newValue) {
      if (newValue == true) {
        this.$Progress.start();    
      }       
      if (newValue == false) {
        this.$Progress.finish();
      } 
    }
  },

  methods: {
    
    dragStart: function(evt, todo) {      
      evt.dataTransfer.dropEffect = 'move'
      evt.dataTransfer.effectAllowed = 'move'
      evt.dataTransfer.setData('itemID', todo.id)
    },

    dragEnter: function(evt) {
      evt.target.classList.add("drag");
      evt.preventDefault();
    },
    
    dragLeave: function(evt) {
      evt.target.classList.remove("drag");
      evt.preventDefault();
    },

    dragDrop: async function(evt, destTodo) {      
      evt.target.classList.remove("drag");   
      const sourceId = evt.dataTransfer.getData('itemID')
      const sourceTodo = this.todos.find((t => t.id == sourceId))      
      const sourceIndex = this.todos.indexOf(sourceTodo);
      const destIndex = this.todos.indexOf(destTodo);
      this.todos[sourceIndex] = destTodo;
      this.todos[sourceIndex].order = sourceIndex + 1
      this.todos[destIndex] = sourceTodo;
      this.todos[destIndex].order = destIndex + 1;      

      const userId = this.userId ?? "public";
      
      await fetch(API + `/id/${destTodo.id}`, {
          headers: HEADERS,
          method: "PATCH",
          body: JSON.stringify({ order: destTodo.order, owner_id: userId })
        });

      await fetch(API + `/id/${sourceTodo.id}`, {
          headers: HEADERS,
          method: "PATCH",
          body: JSON.stringify({ order: sourceTodo.order, owner_id: userId })
        });
    },

    getTodos: function () {
      this.isLoading = true;
      
      fetch(API + "?$orderby=order", { headers: HEADERS, method: "GET" })
        .then(res => { return res.json(); })
        .then(res => {
          var _todos = res == null ? [] : res.value;                      
          this.todos = _todos.sort((a,b) => {
            if (a.order == undefined) return 1;
            if (b.order == undefined) return -1;
            return a - b;
          });                              
          this.isLoading = false;          
        }, res => {
          this.isLoading = false;
        });
    },

    addTodo: function () {
      var value = this.newTodo && this.newTodo.trim();
      if (!value) return;

      fetch(API, {
        headers: HEADERS,
        method: "POST",
        body: JSON.stringify({ title: value, order: this.todos.length+1, owner_id: this.userId ?? "public" })
      }).then(res => {
        if (res.ok) {
          this.newTodo = ''
          return res.json();
        }
      }).then(res => {
        this.todos.push(res.value[0]);
      })
    },

    completeTodo: function (todo) {
      fetch(API + `/id/${todo.id}`, {
        headers: HEADERS,
        method: "PATCH",
        body: JSON.stringify({ completed: todo.completed, order: todo.order, owner_id: this.userId ?? "public" })
      });
    },

    removeTodo: function (todo) {
      fetch(API + `/id/${todo.id}`, {
        headers: HEADERS,
        method: "DELETE"
      }).then(res => {
        if (res.ok) {
          var index = this.todos.indexOf(todo);
          this.todos.splice(index, 1);
        }
      })
    },

    editTodo: function (todo) {
      this.beforeEditCache = todo.title;
      this.editedTodo = todo;
    },

    doneEdit: function (todo) {
      if (!this.editedTodo) {
        return;
      }
      this.editedTodo = null;
      todo.title = todo.title.trim();
      if (!todo.title) {
        this.removeTodo(todo);
      } else {
        fetch(API + `/id/${todo.id}`, {
          headers: HEADERS,
          method: "PATCH",
          body: JSON.stringify({ title: todo.title, order: todo.order, owner_id: this.userId ?? "public" })
        });
      }
    },

    cancelEdit: function (todo) {
      this.editedTodo = null;
      todo.title = this.beforeEditCache;
    },

    removeCompleted: function () {
      filters.completed(this.todos).forEach(t => {
        this.removeTodo(t);
      });
    },

    pluralize: function (term, count) {
      if (count > 1)
        return term + 's';
      else
        return term;
    }
  },

  directives: {
    "todo-focus": function (el, binding) {
      if (binding.value) {
        el.focus();
      }
    }
  }
};

</script>

