import UserModel from '../../Users/models/users.models'

exports.getTracks = async (userId, perPage, page) => {
    let tracks = [];
    let newTrack = await UserModel.findTracks(userId,perPage, page);
    // console.log(newTrack, "New")
    for (let i = 0; i < newTrack.tracks.length; i++) {
        await UserModel.findById(newTrack.tracks[i])
            .then((user) => {
                delete user.password;
                delete user.permissionLevel;
                delete user.tracks;
                // console.log("User", user)
                tracks.push(user);
                console.log("dans boucle", tracks)
            });
    }
    // console.log("Farany", tracks);
    return tracks;
};


exports.createTrack = async (userid, body) => {
    console.log('userid',userid)
    console.log('body',body)
     UserModel.findById(userid).then((user) => {
        user.tracks.push(body.id)
        console.log('user',user)
        return UserModel.patchUser(userid,user)
    });
};