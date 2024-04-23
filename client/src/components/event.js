import React, { useState, useEffect } from "react";
import "./CSS/all.css"; // Import CSS for styling
import classes from './CSS/eventcard.module.css';
import axios from "axios";
import { useRouteLoaderData } from "react-router-dom";
import backgroundImage from './bg.jpg';

// function EventCard({ event, onRegister, onCancel}) {
//   function formatDate(dateString) {
//     const date = new Date(dateString);
//     const formatter = new Intl.DateTimeFormat('en-US', {
//       month: 'long',
//       day: 'numeric',
//       year: 'numeric',
//     });
//     return formatter.format(date);
//   }

//   const handleRegister = () => {
//     console.log("Register button clicked");
//     onRegister(event.eid);
//   };

//   // const handleCancel = () => {
//   //   onCancel(event.eid);
//   // };
//   const handleInvite = () => {
//     console.log("Invite button clicked");
//     onInviteAlumni(event.eid);
//   };

//   const registrations = `${event.registeredstudents}/${event.seats}`;
//   return (
//     <div className="event-card">
//       <h3>{event.title}</h3>
//       <p>Date: {formatDate(event.date)}</p>
//       <p>Location: {event.location}</p>
//       <p>Description: {event.description}</p>
//       <p>Seats : {event.seats}</p>
//       <p>Registrations: {registrations}</p>
//       <button onClick={handleRegister}>Register</button>
//       <button onClick={handleInvite}>Invite Alumni</button>
//       {/* <button onClick={handleCancel}>Cancel Event</button> */}
//     </div>
//   );
// }


function EventPage() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    location: "",
    description:"",
    seats:"",
    registeredstudents:""
  });
  const [showModal, setShowModal] = useState(false);
  const [showAlumniModal, setShowAlumniModal] = useState(false);
  const [alumniList, setAlumniList] = useState([
    { aid: 1, name: "John Doe" },
    { aid: 2, name: "Jane Smith" },
    { aid: 3, name: "Alice Johnson" }
  ]);
  const [selectedAlumni, setSelectedAlumni] = useState([]);
  const [invitingEventId, setInvitingEventId] = useState(null); // Track which event's alumni are being invited
  const userInfo = useRouteLoaderData('studentData');
  const sid=userInfo.data.sid;
  const checkUserRegistrations = async (eevents) => {
    try {
      const response = await axios.get("http://localhost:9000/register/api/userregistrations");
      const userRegistrations = response.data;
      // console.log(userRegistrations);
      // Check if user is registered for each event and update state accordingly
      const updatedEvents = eevents.map(event => {
        //Yahape mostly registration.eid_fk hai check once
        const isRegistered = userRegistrations.some(registration => (registration.eid_fk === event.eid )&&registration.sid_fk===sid);
        // console.log(isRegistered);
        return { ...event, registered: isRegistered };
      });
      // const registrationMessage = "";
      return updatedEvents;
    } catch (error) {
      console.error("Error checking user registrations:", error);
    }
  };
  const updateData = async () => {
    try {
      const res = await axios.get("http://localhost:9000/event/api/events");
      const upcomingEvents = res.data.filter((event) => new Date(event.date) > new Date());
      const fupcomingEvents=await checkUserRegistrations(upcomingEvents);

      try {
        const res = await axios.get(`http://localhost:9000/manageevents/api/allalumni`);
        setAlumniList(res.data);
        console.log(res.data);
      } catch (error) {
        console.error("Error in fetching alumni list",error)
      }
      setEvents(fupcomingEvents);
    } catch (error) {
      console.error("Error updating eventsData:", error);
    }
  };

  useEffect(()=>{
    updateData();
  },[]);

  useEffect(()=>{
    try {
      async function getRequestSentAlumni(invitingEventId){
        if(invitingEventId===null)
        return;
        else{
          const res= await axios.get("http://localhost:9000/manageevents/api/requests/e/"+invitingEventId);
          //from the above step we will get the alumni to whom request has already been sent
          console.log(res);
          setSelectedAlumni(res.data)
        }
      }
      getRequestSentAlumni(invitingEventId);
    } catch (error) {
      console.error("Can't get alumni that have already been checked",error);
    }
  },[invitingEventId])

  const [registrationMessage, setRegistrationMessage] = useState("");
  // fill registrationEventId with an array instead of null
  const [registrationEventId, setRegistrationEventId] = useState("");

  const handleRegisterEvent = async(eventId) => {
    try {
      const eventss = await checkUserRegistrations(events);
      const event = eventss.find(event => event.eid === eventId);
      if (event.registered) {
        setRegistrationMessage("You have already registered for this event.");
        return;
      }
      const res=await axios.put(`http://localhost:9000/event/api/events/${eventId}/register`,{sid:sid});
      console.log(res);
      updateData(); 
      setRegistrationMessage("Registered successfully!");
      console.log("Registration message:", registrationMessage);
    } catch (error) {
      console.error("Error registering for event:", error);
    }
  };

  // const handleCancelRegistration = () => {
  //   setRegistrationEventId(null);
  //   setRegistrationMessage(""); //Did not work as db was not implemented
  // };

  // const handleCancelEvent = async (eventId) => {
  //   setEvents(events.filter((event) => event.eid !== eventId)); // Update UI first (optimistic)
  
  //   try {
  //     const res = await axios.delete(`http://localhost:9000/event/api/events/${eventId}`);
  //     console.log(res);
  //     updateData();
  //     } catch (error) {
  //     console.error("Error removing from the database:", error);

  //     // setEvents(events.filter((event) => event.eid === eventId)); 
  //   }
  // };
  
  const handleAddEvent = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveEvent = async () => {
    //Sending newEvent object to Backend
    const res= await axios.post("http://localhost:9000/event/api/events",newEvent);
    console.log(res);
    const eid = events.length-1 + 1;
    const updatedEvents = [...events, { ...newEvent, eid }];
    setEvents(updatedEvents);
    setShowModal(false);
    setNewEvent({
      title: "",
      date: "",
      location: "",
      description:"",
      seats:"",
      registeredStudents:""
    });
  };

  const handleCancelModal = () => {
    setShowModal(false);
    setNewEvent({
      title: "",
      date: "",
      location: "",
      description: "",
      seats: "",
      registeredStudents:""
    });
  };

  const handleInviteAlumni = (eventId) => {
    // Set the eventId in state to track which event's alumni are being invited
    setInvitingEventId(eventId);
    setShowAlumniModal(true);
  };

  const handleAlumniSelection = (alumni) => {
    const isSelected = selectedAlumni.some((a) => a.aid === alumni.aid);
    if (isSelected) {
      setSelectedAlumni(selectedAlumni.filter((a) => a.aid !== alumni.aid));
    } else {
      setSelectedAlumni([...selectedAlumni, alumni]);
    }
  };

  const sendInvitations = async () => {
    try {
      const selectedAlumniIds = selectedAlumni.map((alumni) => alumni.aid);
      const res = await axios.post(`http://localhost:9000/manageevents/api/requests/${invitingEventId}`, { alumniIds: selectedAlumniIds,sid:sid });
      console.log(res);
      setShowAlumniModal(false);
      setSelectedAlumni([]);
      console.log("Invitations sent successfully!");
    } catch (error) {
      console.error("Error sending invitations:", error);
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    return formatter.format(date);
  };

  // const handleInvite = () => {
  //   console.log("Invite button clicked");
  //   handleInviteAlumni(event.eid);
  // };

  return (
    <div className="page-container" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", minHeight: "100vh" }}>
      <div className={classes.container}>
        <h2>Upcoming Events</h2>
        <div className="event-cards">
        {events.map((event) => (
            <div className={"event-card" + (event.registered===true ? " registered" : "")} key={event.eid}>
              <h3>{event.title}</h3>
              <p>Date: {formatDate(event.date)}</p>
              <p>Location: {event.location}</p>
              <p>Description: {event.description}</p>
              <p>Seats : {event.seats}</p>
              <p>Registrations:{`${event.registeredstudents}/${event.seats}`}</p>
              {event.registered===false ? (
                <button onClick={() => handleRegisterEvent(event.eid)}>Register</button>
              ) : (
                <>
                  <p>You have successfully registered</p> 
                  {/* <button onClick={handleCancelRegistration}>Cancel Registration</button> */}
                </>
              )}
              <button onClick={()=>{
                  console.log("Invite button clicked");
                  handleInviteAlumni(event.eid);
              }}>Invite Alumni</button>

              {/* <button onClick={() => handleCancelEvent(event.eid)}>Cancel Event</button> */}
            </div>
          ))}
        </div>
        <div className="add-event">
          <button id="addEventBtn" onClick={handleAddEvent}>
            Add Event
          </button>
        </div>
        {showModal && (
          <div id="myModal" className="modal">
            <div className="modal-content">
              <span className="close" onClick={handleCloseModal}>&times;</span>
              <h2>Add Event</h2>
              <input type="text" placeholder="Title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
              <input type="date" placeholder="Date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
              <input type="text" placeholder="Location" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
              <input type="text" placeholder="Description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
              <input type="number" placeholder="Seats" value={newEvent.seats} onChange={(e) => setNewEvent({ ...newEvent, seats: e.target.value,registeredstudents:0,registered:false })} />
              <button onClick={handleSaveEvent}>Save</button>
              <button onClick={handleCancelModal}>Cancel</button>
              
              </div>
          </div>
        )}
        {showAlumniModal && (
          <div id="alumniModal" className="modal">
            <div className="modal-content modal-container">
              <span className="close" onClick={() => setShowAlumniModal(false)}>&times;</span>
              <h2 className="modal-container-title">Select Alumni to Invite</h2>
              {alumniList.map((alumni) => (
                <div key={alumni.id}>
                  <input
                    type="checkbox"
                    id={`alumni_${alumni.aid}`}
                    checked={selectedAlumni.some((a) => a.aid === alumni.aid)}
                    onChange={() => handleAlumniSelection(alumni)}
                  />
                  <label htmlFor={`alumni_${alumni.id}`}>{alumni.username}</label>
                </div>
              ))}
              <button className="button is-primary" onClick={sendInvitations}>Send Invites</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventPage;


