import axios from "axios";
import { BASE_URL, API_KEY } from "@env";
import ApiPaths from "./ApiPaths";

const Axios = axios.create({
  baseURL: BASE_URL,
});

export async function getHeadlines(page) {
  const config = {
    headers: {
      Authorization: API_KEY,
    },
    params: {
      q: "bitcoin",
      pageSize: 10,
      page: page,
    },
  };

  try {
    const response = await Axios.get(ApiPaths.getHeadlines, config);
    return {
      success: response?.data,
    };
  } catch (error) {
    return {
      error: {
        message: error?.response?.data?.error,
      },
    };
  }
}
