class ApplicationController < ActionController::API
  rescue_from ActionDispatch::Http::Parameters::ParseError do
    render json: { error: "Invalid JSON" }, status: :bad_request
  end
end
