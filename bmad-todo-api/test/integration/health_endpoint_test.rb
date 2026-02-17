# frozen_string_literal: true

require "test_helper"

class HealthEndpointTest < ActionDispatch::IntegrationTest
  test "GET /up returns 200 when app is healthy" do
    get "/up"
    assert_response :success
    assert_equal 200, response.status
  end

  test "GET /up returns plain text or json body" do
    get "/up"
    assert_response :success
    # Rails health check returns a body; ensure we get something
    assert response.body.present?
  end
end
