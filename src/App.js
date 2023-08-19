import React from "react";
import ChatGPT from "./chatgpt";

import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  Map, GoogleApiWrapper
} from "@react-google-maps/api";

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import { formatRelative } from "date-fns";

import "@reach/combobox/styles.css";
import mapStyles from "./mapStyles";

const libraries = ["places"];
const mapContainerStyle = {
  height: "100vh",
  width: "100vw",
};
const options = {
  styles: mapStyles,
  disableDefaultUI: false,
  zoomControl: true,
};
const center = {
  lat: '',
  lng: '',
};


// const apiKey = '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';
// const apiUrl = 'https://api.openai.com/v1/engines/gpt-3.5-turbo/completions'; // Replace 'text-davinci-002' with the appropriate engine name
// //
// //
// const generateText = async () => {
//   try {
//     const response = await axios.post(apiUrl, {
//       prompt: 'Once upon a time',
//       max_tokens: 100,
//     }, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${apiKey}`,
//       }
//     });

//     const generatedText = response.data.choices[0].text;
//     console.log(generatedText);
//   } catch (error) {
//     console.error('Error generating text:', error);
//   }
// }









export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const [markers, setMarkers] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [locationName, setLocationName] = React.useState('');

  const api = "AIzaSyBux_rnoluYvGquIOF-N5grMqdT06Q5B_E";
  const getLocationName = (lat, lng) => {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${api}`;
    // const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location${lat}.${lng}&rankby=distance&key=${api}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.results.length > 0) {
          const placeName = data.results[0].formatted_address;

          console.log('Place Name:', placeName);
          console.log(data.toString());
          return placeName;
        } else {
          console.log('Location not found');
          return lat+" "+lng;
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        return "Cannot Resolve Location";
      });
  };

  const onMapClick = React.useCallback((e) => {
    setMarkers((current) => [
      ...current,
      { 
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        name : getLocationName( e.latLng.lat(),  e.latLng.lng()),
        time: new Date(),
      },
    ]);
    
  }, []);

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
    setMarkers((current) => [
      ...current,
      { 
        lat: lat,
        lng: lng,
        name : getLocationName(lat,lng),
        time: new Date(),
      },
    ]);
  }, []);

  if (loadError) return "Error";
  if (!isLoaded) return "Loading...";

  return (
    <div>
      <h1>
        CAS{" "}
        <span role="img" aria-label="tent">
        ✍🏻
        </span>
      </h1>

      <Locate panTo={panTo} />
      <Search panTo={panTo} />

      <GoogleMap
        id="map"
        mapContainerStyle={mapContainerStyle}
        zoom={8}
        center={center}
        // options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}
      >
        {markers.map((marker) => (
          <Marker
            key={`${marker.lat}-${marker.lng}`}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => {
              setSelected(marker);
            }}
            icon={{
              url: `/marker.svg`,
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(15, 15),
              scaledSize: new window.google.maps.Size(30, 30),
            }}
          ></Marker>
        ))}

        {selected ? (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            
            onCloseClick={() => {
              setSelected(null);
            }}
            
           
          >
            
            <div>
            <ChatGPT name={selected.name}/>
              <p>Spotted {formatRelative(selected.time, new Date())}</p>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </div>
  );
}

function Locate({ panTo }) {
  return (
    <button
      className="locate"
      onClick={() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            panTo({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => null
        );
      }}
    >
      <img src="/compass.svg" alt="compass" />
    </button>
  );
}

function Search({ panTo }) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => 43.6532, lng: () => -79.3832 },
      radius: 100 * 1000,
    },
  });

  // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompletionRequest

  const handleInput = (e) => {
    setValue(e.target.value);
  };

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      panTo({ lat, lng });
    } catch (error) {
      console.log("😱 Error: ", error);
    }
  };

  return (
    <div className="search">
      <Combobox onSelect={handleSelect}>
        <ComboboxInput
          value={value}
          onChange={handleInput}
          disabled={!ready}
          placeholder="Search your location"
        />
        <ComboboxPopover>
          <ComboboxList>
            {status === "OK" &&
              data.map(({ id, description }) => (
                <ComboboxOption key={id} value={description} />
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}
