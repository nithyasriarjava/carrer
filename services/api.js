const BASE_URL =
  "https://carrear-guidence-backend.onrender.com";



export const getDepartments = async () => {

  const response =
    await fetch(
      `${BASE_URL}/departments`
    );

  return response.json();

};

export const getCareerDepartments = async () => {

  const response = await fetch(
    `${BASE_URL}/career_departments`
  );

  return response.json();

};

export const getSkills = async () => {

  const response =
    await fetch(
      `${BASE_URL}/skills`
    );

  return response.json();

};

console.log("skills",getSkills())


export const getInterests = async () => {

  const response =
    await fetch(
      `${BASE_URL}/interests`
    );

  return response.json();

};



export const getCareers = async () => {

  const response =
    await fetch(
      `${BASE_URL}/careers`
    );

  return response.json();

};



export const getRoadmaps = async () => {

  const response =
    await fetch(
      `${BASE_URL}/roadmaps`
    );

  return response.json();

};



export const getLearningResources = async () => {

  const response = await fetch(

    `${BASE_URL}/learning_resources`

  );

  return response.json();

};



export const getCareerSkills = async () => {

  const response =
    await fetch(
      `${BASE_URL}/career_skills`
    );

  return response.json();

};



export const getCareerInterests = async () => {

  const response =
    await fetch(
      `${BASE_URL}/career_interests`
    );

  return response.json();

};



export const getUserProgress = async () => {

  const response =
    await fetch(
      `${BASE_URL}/user_progress`
    );

  return response.json();

};

export const saveUserProgress = async (data) => {
  const response = await fetch(`${BASE_URL}/user_progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

export const checkUserPreferences = async (userId) => {
  const response = await fetch(`${BASE_URL}/user_preferences/${userId}`);
  if (response.status === 404) {
    return { exists: false };
  }
  if (!response.ok) {
    throw new Error("Failed to fetch preferences");
  }
  const data = await response.json();
  return { exists: true, preferences: data };
};

export const savePreferences = async (data) => {
  const response = await fetch(`${BASE_URL}/save_preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return response.json();
};