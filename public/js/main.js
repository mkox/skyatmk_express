
function open_win(element) {
    var howMuchActorSitesTogether_raw = document.getElementById('how_much_actor_sites_together');
    var howMuchActorSitesTogether = howMuchActorSitesTogether_raw.value;
    console.log('howMuchActorSitesTogether: ', howMuchActorSitesTogether);

    const followersUnparsed = document.getElementById('jsonActors').textContent;
    const followers = JSON.parse(followersUnparsed);
    console.log('followers: ', followers);

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
    for(let i = (minPages - 1); i <= (maxPages - 1); i++) {
      openSingleWindow (followers[i], isoDate);
    }
  }

  async function openSingleWindow (follower, isoDate) { 
    // window.open('https://twitter.com/' + follower.twUser.username);
    window.open('https://bsky.app/');

    // var openDateResult = await app.service('tfollow').update(follower.twUserId, 
    //   { 
    //     isoDate: isoDate,
    //     updateOption: 'addOpenDate'
    //   }
    // );
    // //console.log('openDateResult: ');
    // //console.log(openDateResult);
    
  }

  // // Renders a single follower on the page
  // function addFollower (follower) {
  //   followersCount++;
  //   document.getElementById('user-list').innerHTML += 
  //   `<p>${followersCount} - <a href="https://twitter.com/${follower.twUser.username}" target="_blank">${follower.twUser.username}</a> - ${follower.twUser.name} - ${follower.twUser.public_metrics.followers_count} - ${follower.twUser.public_metrics.following_count} - ${follower.twUser.public_metrics.tweet_count} - ` + Math.round(follower.twUser.public_metrics.tweets_per_follower * 1000) / 1000 +  ` - ${follower.followedIds.length} - ${follower.twUser.location} - ${follower.twUser.description}</p>`;
  // }

  // // Renders a single followed to a select form
  // function addFollowed (followed) {
  //   document.getElementById('followed-for-random-users').innerHTML += 
  //   `<option value="${followed.twUserId}">${followed.twUser.username}</option>`
  // }

  // const afterStart = async () => {
  //   const followed = await app.service('followed').find();
  //   console.log(followed);
  //   var followedData = followed.data;
  //   followedData.sort(function(a, b){  
  //     let x = a.twUser.username.toLowerCase();
  //     let y = b.twUser.username.toLowerCase();
  //     if (x < y) {return -1;}
  //     if (x > y) {return 1;}
  //     return 0;
  //     }
  //   ); 
  //   console.log('followedData after sort: ', followedData);
  //   followedData.forEach(addFollowed);
  // }