function open_win(element) {
    //console.log('open_win element: ');
    //console.log(element);
    var buttonCollection = document.getElementsByClassName('button-user-sites');
    for (let i = 0; i < buttonCollection.length; i++) {
      buttonCollection[i].style.backgroundColor = '';
    }
    element.style.backgroundColor = 'red';
    var maxPages = parseInt(element.value)
    var minPages;
    if(maxPages != followers.length) {
      minPages = maxPages - howMuchUserSitesTogether + 1;
    } else {
      var followersModulo = followers.length % howMuchUserSitesTogether;
      if(followersModulo !== 0) {
        minPages = followers.length - followersModulo + 1
      } else {
        minPages = followers.length - howMuchUserSitesTogether + 1
      }
    }

    var date = new Date();  // at the start of this method
    var isoDate = date.toISOString();
    for(let i = (minPages - 1); i <= (maxPages - 1); i++) {
      openSingleWindow (followers[i], isoDate);
    }
  }