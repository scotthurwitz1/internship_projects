import json
import uuid
import base64
import os
from datetime import datetime, timezone
import boto3
from botocore.exceptions import ClientError
import time

class performance_monitor:
    def __init__(self):

        self.__cb_sent_stamp = None
        # config
        self.__target_latency = 4
        self.__log_group = '/aws/lambda/gt-distributionplatform-ss-appsub-create-ca-Lambda-wqk2EVE1fGy0'

    def get_target_latency(self):
        target_latency = self.__target_latency
        return target_latency

    def get_duration(self, SenderTrackingID):
        cloudwatch_logs = boto3.client('logs')

        # Pre Query
        # set query time params
        dt = datetime.now(timezone.utc)
        et = int(dt.timestamp())
        st = et - 600
        # print sender tracking
        print(senderTrackingID)
        # give cloudwatch time to update
        time.sleep(10)
        # Filter logs by message
        filter_pattern = '{($.message = "Lambda finished processing POST request")||($.message = "Lambda started processing POST request")}'

        #Query
        # Query cloudwatch using added Filter permission
        response = cloudwatch_logs.filter_log_events(
            logGroupName=self.__log_group,
            filterPattern=filter_pattern,
            startTime=st * 1000,
            endTime=et * 1000
            # limit = 1000
        )

        #Post Query
        # navigating through the response json
        log_events = response['events']
        # loop through logs and filter by sender tracking id
        for index, log_event in enumerate(log_events):
            # filter by tracking id
            if senderTrackingID == json.loads(log_event['message'])["correlation_id"]:
                # get starting log
                prev_event = log_events[index - 1]
                date = json.loads(prev_event['message'])["timestamp"]
                # format timestamp
                date_part, time_part = date.split(" ")
                ms = time_part.split(",")[1]
                time1 = time_part.split(",")[0]
                start_iso = f"{date_part}T{time1}.{ms[:3]}+00:00"
                print("case created at " + start_iso)
        # create case in unix
        start_float = (datetime.fromisoformat(start_iso)).timestamp()
        # callback in unix
        end_float = (datetime.fromisoformat(self.__cb_sent_stamp)).timestamp()
        # calculate duration
        duration = round((end_float - start_float), 3);
        print("duration")
        print(duration)
        return duration

    def get_current_ts(self):
        # end time for duration calculation
        self.__cb_sent_stamp = datetime.now(
            timezone.utc).isoformat(timespec='milliseconds')
        print("callback called at: ")
        print(self.__cb_sent_stamp)

