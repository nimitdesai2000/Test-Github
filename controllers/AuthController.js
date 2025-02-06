const authService = require("../service/AuthService");
const { APIResponse } = require("../utility/apihandler/APIResponse");
const { Result } = require("../utility/Result");
const { HttpStatusCode } = require("../utility/HttpStatusCode");

const loginUser = async (req, res) => {
  try {
    const { data, result } = await authService.loginUser(req.body);
    if (result == 1) {
      APIResponse(
        res,
        HttpStatusCode.OK,
        Result.SUCCESS,
        data,
        t("user.login.success")
      );
    } else {
      APIResponse(
        res,
        HttpStatusCode.UNAUTHORIZED,
        Result.FAIL,
        data,
        t("user.login.conflict")
      );
    }
  } catch (error) {
    APIResponse(
      res,
      HttpStatusCode.INTERNAL_SERVER,
      Result.FAIL,
      {},
      t("user.login.error")
    );
  }
};

const registerUser = async (req, res) => {
  try {
    const { result } = await authService.registerUser(req.body);
    if (result == 1) {
      APIResponse(
        res,
        HttpStatusCode.OK,
        Result.SUCCESS,
        {},
        t("user.register.success")
      );
    } else if (result == 2) {
      APIResponse(
        res,
        HttpStatusCode.CONFLICT,
        Result.FAIL,
        {},
        t("user.register.conflict")
      );
    } else {
      APIResponse(
        res,
        HttpStatusCode.UNAUTHORIZED,
        Result.FAIL,
        {},
        t("user.otp.conflict")
      );
    }
  } catch (error) {
    APIResponse(
      res,
      HttpStatusCode.INTERNAL_SERVER,
      Result.FAIL,
      {},
      t("user.register.error")
    );
  }
};

const loginWithGoogle = async (req, res) => {
  try {
    const { data, result } = await authService.loginWithGoogle(req);
    if (result == 1) {
      APIResponse(
        res,
        HttpStatusCode.OK,
        Result.SUCCESS,
        data,
        t("user.login.success")
      );
    } else {
      APIResponse(
        res,
        HttpStatusCode.UNAUTHORIZED,
        Result.FAIL,
        data,
        t("user.login.conflict")
      );
    }
  } catch (error) {
    console.log("ERROR ", error);
    APIResponse(
      res,
      HttpStatusCode.INTERNAL_SERVER,
      Result.FAIL,
      {},
      t("user.login.error")
    );
  }
};

const generateAuthCodeUrl = async (req, res) => {
  try {
    const { data, result } = await authService.generateAuthCodeUrl();
    if (result == 1) {
      APIResponse(
        res,
        HttpStatusCode.OK,
        Result.SUCCESS,
        data,
        t("user.logout.success")
      );
    }
  } catch (error) {
    console.log("ERROR ", error);
    APIResponse(
      res,
      HttpStatusCode.INTERNAL_SERVER,
      Result.FAIL,
      {},
      t("user.logout.error")
    );
  }
};

const loginWithMicrosoft = async (req, res) => {
  try {
    const { data, result } = await authService.loginWithMicrosoft(req);
    if (result == 1) {
      APIResponse(
        res,
        HttpStatusCode.OK,
        Result.SUCCESS,
        data,
        t("user.login.success")
      );
    } else {
      APIResponse(
        res,
        HttpStatusCode.UNAUTHORIZED,
        Result.FAIL,
        data,
        t("user.login.conflict")
      );
    }
  } catch (error) {
    console.log("ERROR ", error);
    APIResponse(
      res,
      HttpStatusCode.INTERNAL_SERVER,
      Result.FAIL,
      {},
      t("user.login.error")
    );
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { result } = await authService.verifyOTP(req.body);
    if (result == 1) {
      APIResponse(
        res,
        HttpStatusCode.OK,
        Result.SUCCESS,
        {},
        t("user.otp.success")
      );
    } else {
      APIResponse(
        res,
        HttpStatusCode.UNAUTHORIZED,
        Result.FAIL,
        {},
        t("user.otp.conflict")
      );
    }
  } catch (error) {
    APIResponse(
      res,
      HttpStatusCode.INTERNAL_SERVER,
      Result.FAIL,
      {},
      t("user.otp.error")
    );
  }
};

const generateOTP = async (req, res) => {
  try {
    const { result } = await authService.generateOTP(req.body);
    if (result == 1) {
      APIResponse(
        res,
        HttpStatusCode.OK,
        Result.SUCCESS,
        {},
        t("user.otp.generate.success")
      );
    } else if (result == 2) {
      APIResponse(
        res,
        HttpStatusCode.CONFLICT,
        Result.FAIL,
        {},
        t("user.register.conflict")
      );
    } else {
      APIResponse(
        res,
        HttpStatusCode.UNAUTHORIZED,
        Result.FAIL,
        {},
        t("email.error")
      );
    }
  } catch (error) {
    APIResponse(
      res,
      HttpStatusCode.INTERNAL_SERVER,
      Result.FAIL,
      {},
      t("user.otp.generate.error")
    );
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { result } = await authService.forgotPassword(req.body);
    console.log("API ", result);
    if (result == 1) {
      APIResponse(
        res,
        HttpStatusCode.OK,
        Result.SUCCESS,
        {},
        t("user.register.success")
      );
    } else if (result == 2) {
      APIResponse(
        res,
        HttpStatusCode.CONFLICT,
        Result.FAIL,
        {},
        t("user.not.found")
      );
    } else {
      APIResponse(
        res,
        HttpStatusCode.CONFLICT,
        Result.FAIL,
        {},
        t("email.error")
      );
    }
  } catch (error) {
    APIResponse(
      res,
      HttpStatusCode.INTERNAL_SERVER,
      Result.FAIL,
      {},
      t("user.register.error")
    );
  }
};

const resetPassword = async (req, res) => {
  try {
    const { result } = await authService.resetPassword(req.body);
    if (result == 1) {
      APIResponse(
        res,
        HttpStatusCode.OK,
        Result.SUCCESS,
        {},
        t("user.reset.password.success")
      );
    } else {
      APIResponse(
        res,
        HttpStatusCode.NOT_FOUND,
        Result.FAIL,
        {},
        t("user.reset.password.error")
      );
    }
  } catch (error) {
    APIResponse(
      res,
      HttpStatusCode.INTERNAL_SERVER,
      Result.FAIL,
      {},
      t("user.reset.password.error")
    );
  }
};

const logoutUser = async (req, res) => {
  try {
    const { data, result } = await authService.logoutUser(req.body);
    if (result == 1) {
      APIResponse(
        res,
        HttpStatusCode.OK,
        Result.SUCCESS,
        data,
        t("user.logout.success")
      );
    }
  } catch (error) {
    console.log("ERROR ", error);
    APIResponse(
      res,
      HttpStatusCode.INTERNAL_SERVER,
      Result.FAIL,
      {},
      t("user.logout.error")
    );
  }
};

module.exports = {
  loginUser,
  registerUser,
  loginWithGoogle,
  generateAuthCodeUrl,
  loginWithMicrosoft,
  verifyOTP,
  generateOTP,
  forgotPassword,
  resetPassword,
  logoutUser,
};
