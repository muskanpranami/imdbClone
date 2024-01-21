"use strict";
(function () {
  // Extracting all the HTML attributes using DOM
  const searchKeyword = document.getElementById("search");
  const suggestionsContainer = document.getElementById("card-container");
  const favMoviesContainer = document.getElementById("fav-movies-container");
  const emptyText = document.getElementById("empty-search");
  const showFavourites = document.getElementById("favorites-section");
  const emptyFavText = document.getElementById("empty-fav");

// Function Call
  addFav();
  showEmpty();

  let suggestionList = [];
  let favMovieArray = [];
  let debounceTimeout;

  // Event Listener on the Search Button
  searchKeyword.addEventListener("keydown", (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
    }
  });

  //Showing the behaviour of the favorites section text when it is filled and empty
  function showEmpty() {
    if (favMoviesContainer.innerHTML == "") {
      emptyFavText.style.display = "block";
    } else {
      emptyFavText.style.display = "none";
    }
  }

  // Event listener on search while typing on the textbox
  searchKeyword.addEventListener("input", function () {
    let search = searchKeyword.value.trim();
    clearTimeout(debounceTimeout);

    //Debounce functionality to not fire the code abruptly
    debounceTimeout = setTimeout(async () => {
      //if the search is empty
      if (search === "") {
        //display the expty text in block form
        emptyText.style.display = "block";
        suggestionsContainer.innerHTML = "";
        //empty the suggestion array
        suggestionList = [];
      } else {
        //hide the empty text String
        emptyText.style.display = "none";
        try {
          //fetch movies from the API, store in data variable and call addSuggestions function
          let data = await fetchMovies(search);
          addSuggestions(data);
        } catch (err) {
          console.error(err);
        }
        display the suggestions in the grid layout
        suggestionsContainer.style.display = "grid";
      }
    }, 300); // 300 milliseconds debounce time
  });

  // Fetches data from API and calls function to add it in
  async function fetchMovies(search) {
    const url = `https://www.omdbapi.com/?t=${search}&apikey=d19cd846`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  }

  // Shows in suggestion container DOM
  function addSuggestions(data) {
    document.getElementById("empty-fav").style.display = "none";
    let isPresent = false;

    // to check if the movie is already present in the suggestionList array
    suggestionList.forEach((movie) => {
      if (movie.Title == data.Title) {
        isPresent = true;
      }
    });

    if (!isPresent && data.Title != undefined) {

      suggestionList.push(data);
      const movieCard = document.createElement("div");
      movieCard.setAttribute("class", "text-decoration");
      
// Setting the style of the Movie Cards
      movieCard.innerHTML = `
        <div class="card my-2" data-id = " ${data.Title} ">
        <a href="moviePage.html" >
          <img
            src="${data.Poster} "
            class="card-img-top"
            alt="..."
            data-id = "${data.Title} "
          />
          <div class="card-body text-start">
            <h5 class="card-title" >
              <a href="moviePage.html" data-id = "${data.Title} "> ${data.Title}  </a>
            </h5>

            <p class="card-text">
              <i class="fa-solid fa-star">
                <span id="rating">&nbsp;${data.imdbRating}</span>
              </i>

              <button class="fav-btn">
                <i class="fa-solid fa-heart add-fav" data-id="${data.Title}"></i>
              </button>
            </p>
          </div>
        </a>
      </div>
    `;
      suggestionsContainer.prepend(movieCard);
    }
  }

  // Add to favourite of localStorage
  async function handleFavBtn(e) {
    const target = e.target;

    let data = await fetchMovies(target.dataset.id);

    let favMoviesLocal = localStorage.getItem("favMoviesList");

    if (favMoviesLocal) {
      favMovieArray = Array.from(JSON.parse(favMoviesLocal));
    } else {
      localStorage.setItem("favMoviesList", JSON.stringify(data));
    }

    // to check if movie is already present in the fav list
    let isPresent = false;
    favMovieArray.forEach((movie) => {
      if (data.Title == movie.Title) {
        notify("It's Already in the List!");
        isPresent = true;
      }
    });

    if (!isPresent) {
      favMovieArray.push(data);
    }

    localStorage.setItem("favMoviesList", JSON.stringify(favMovieArray));
    isPresent = !isPresent;
    addFav();
  }

  // Add to favourite list DOM
  function addFav() {
    favMoviesContainer.innerHTML = "";

    let favList = JSON.parse(localStorage.getItem("favMoviesList"));
    if (favList) {
      favList.forEach((movie) => {
        const div = document.createElement("div");
        div.classList.add(
          "fav-movie-card",
          "d-flex",
          "justify-content-between",
          "align-content-center",
          "my-2"
        );
        div.innerHTML = `
   
    <img
      src="${movie.Poster}"
      alt=""
      class="fav-movie-poster"
    />
    <div class="movie-card-details">
      <p class="movie-name mt-3 mb-0">
       <a href = "moviePage.html" class="fav-movie-name" data-id="${movie.Title}">${movie.Title}<a> 
      </p>
      <small class="text-muted">${movie.Year}</small>
    </div>

    <div class="delete-btn my-4">
        <i class="fa-solid fa-trash-can" data-id="${movie.Title}"></i>
    </div>
    `;

        favMoviesContainer.prepend(div);
      });
    }
  }

  // To notify
  function notify(text) {
    window.alert(text);
  }

  // Delete from favourite list
  function deleteMovie(name) {
    var confirmResult = confirm("Are you sure you want to delete this movie from your favorites?");
if(confirmResult){
  let favList = JSON.parse(localStorage.getItem("favMoviesList"));
  let updatedList = Array.from(favList).filter((movie) => {
    return movie.Title != name;
  });

  localStorage.setItem("favMoviesList", JSON.stringify(updatedList));

  addFav();
  showEmpty();
}
    
  }

  // Handles click events
  async function handleClickListner(e) {
    const target = e.target;

    if (target.classList.contains("add-fav")) {
      e.preventDefault();
      handleFavBtn(e);
    } else if (target.classList.contains("fa-trash-can")) {
      deleteMovie(target.dataset.id);
    } else if (target.classList.contains("fa-bars")) {
      if (showFavourites.style.display == "flex") {
        document.getElementById("show-favourites").style.color = "#8b9595";
        showFavourites.style.display = "none";
      } else {
        showFavourites.classList.add("animate__backInRight");
        document.getElementById("show-favourites").style.color =
          "var(--logo-color)";
        showFavourites.style.display = "flex";
      }
    }

    localStorage.setItem("movieName", target.dataset.id);
  }

  // Event listner on whole document
  document.addEventListener("click", handleClickListner);
})();
