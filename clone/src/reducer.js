export const initialState = {
    user: null,
    room: [],
};

const reducer = (state, action) => {
    switch (action.type) {
        case "SET_USER":
            return {
                ...state,
                user: action.user,
            };
        case "SET_ROOM":
            return {
                ...state,
                room: action.room,
            };
        case "SET_ROOMID":
            return {
                ...state,
                roomId: action.roomId,
            };

        default:
            return state;
    }
};

export default reducer;