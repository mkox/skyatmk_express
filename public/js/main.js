
function open_win(element) {
    var howMuchActorSitesTogether_raw = document.getElementById('how_much_actor_sites_together');
    var howMuchActorSitesTogether = howMuchActorSitesTogether_raw.value;
    console.log('howMuchActorSitesTogether: ', howMuchActorSitesTogether);

    const followersUnparsed = document.getElementById('jsonActors').textContent;
    const followers = JSON.parse(followersUnparsed);
    console.log('followers: ', followers);

    var buttonCollection = document.getElementsByClassName('button-user-sites');
    for (let i = 0; i < buttonCollection.length; i++) {
      buttonCollection[i].style.backgroundColor = '';
    }
    element.style.backgroundColor = 'red';
    var maxPages = parseInt(element.value)
    var minPages;
    if(maxPages != followers.length) {
      minPages = maxPages - howMuchActorSitesTogether + 1;
    } else {
      var followersModulo = followers.length % howMuchActorSitesTogether;
      if(followersModulo !== 0) {
        minPages = followers.length - followersModulo + 1
      } else {
        minPages = followers.length - howMuchActorSitesTogether + 1
      }
    }

    var date = new Date();  // at the start of this method
    var isoDate = date.toISOString();
    var selectedActors = [];
    for(let i = (minPages - 1); i <= (maxPages - 1); i++) {
      openSingleWindow (followers[i], isoDate);
      selectedActors.push(followers[i]);
    }

    const baseUrl = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
    const dataOpenDate = { selectedActors: selectedActors, isoDate: isoDate };
    fetch( baseUrl + '/update-open-date', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataOpenDate)
    })
      .then(response => response.json())
      .then(dataOpenDate => {
        console.log('Success:', dataOpenDate);
      })
      .catch(error => console.error('Error:', error));
  }

  async function openSingleWindow (follower) { 
    window.open('https://bsky.app/profile/' + follower.did);
  }