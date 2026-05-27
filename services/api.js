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

  const response =
    await fetch(
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