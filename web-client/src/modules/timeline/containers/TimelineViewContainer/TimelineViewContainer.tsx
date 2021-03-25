/* eslint-disable no-console */
import { firestore } from 'firebase';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { setOffer } from 'src/ducks/offers/actions';
import { OffersState } from 'src/ducks/offers/types';
import { ProfileState } from 'src/ducks/profile/types';
import {
  // getCavRequestPosts,
  // getMyPinRequestPosts, TODO: (es) Replace with getRequestTimeline
  resetSetRequestState,
  setRequest as updateRequest,
} from 'src/ducks/requests/actions';
import { PostState } from 'src/ducks/requests/types';
import { getPostWithOffersAndTimelineItems } from 'src/ducks/timeline/functions';
import { firestore as firestore2 } from 'src/firebase';
import { IOffer, OfferStatus } from 'src/models/offers';
import { IRequest, RequestStatus } from 'src/models/requests';
import { RequestWithOffersAndTimeline } from 'src/models/requests/RequestWithOffersAndTimeline';
import { ApplicationPreference } from 'src/models/users';
import {
  MyOfferPostsLocationUrl,
  MyRequestPostsLocationUrl,
} from 'src/modules/requests/constants';
import { AppState } from 'src/store';

import LoadingWrapper from '../../../../components/LoadingComponent/LoadingComponent';
import {
  InformationModal,
  makeLocalStorageKey,
} from '../../../../components/Modals/OneTimeModal';
import BottomPanel from '../../components/BottomPanel/BottomPanel';
import OffersList from '../../components/OffersList/OffersList';
import TimelineList from '../../components/TimelineList/TimelineList';
import TopPanel from '../../components/TopPanel/TopPanel';
import {
  // TimelineOfferPostViewLocation,
  TimelineViewLocation,
} from '../../constants';

const TimelineViewContainer: React.FC<{ requestId: string; accepted?: boolean}> = ({
  requestId,
  accepted,
}) => {
  // TODO: (es) - big refactor - rename src/firestore to something else
  const requestRef = firestore2.collection('requests').doc(requestId);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();

  const [request, setRequest] = useState<
    RequestWithOffersAndTimeline | undefined
  >(undefined);

  const [shouldRedirectToFinished, setShouldRedirectToFinished] = useState<
    boolean
  >(false);

  const [shouldRedirectToArchived, setShouldRedirectToArchived] = useState<
    boolean
  >(false);

  const profileState = useSelector(
    ({ profile }: { profile: ProfileState }) => profile,
  );

  const requestsState = useSelector(
    ({ requests }: { requests: PostState }) => requests,
  );

  const offersState = useSelector(
    ({ offers }: { offers: OffersState }) => offers,
  );

  const phoneNumber = useSelector(
    (state: AppState) => state.auth.user?.phoneNumber,
  );

  const isCav =
    profileState?.profile?.applicationPreference === ApplicationPreference.cav;

  useEffect(() => {
    document.title = 'Reach4Help: '.concat(t('routeSubtitles._timeline'));
  });

  useEffect(() => {
    dispatch(resetSetRequestState());
  }, [dispatch]);

  useEffect(() => {
    const requestTemp: RequestWithOffersAndTimeline | undefined =
      requestsState.syncPostWithOffersAndTimelinesState.data;
    // requestTemp =
    //   requestTemp ||
    //   (requestsState.syncCavRequestPostsState.data &&
    //   requestsState.syncCavRequestPostsState.data[requestId]
    //     ? requestsState.syncCavRequestPostsState.data[requestId]
    //     : undefined);
    setRequest(requestTemp);
  }, [requestsState]);

  useEffect(() => {
    if (
      (!requestsState.setAction.loading && requestsState.setAction.success) ||
      (!offersState.setAction.loading && offersState.setAction.success)
    ) {
      dispatch(resetSetRequestState());
      // TODO: (es) change below when we replace use of ApplicatonPreference
      if (isCav) {
        history.replace(MyOfferPostsLocationUrl);
      } else {
        history.replace(MyRequestPostsLocationUrl);
      }
    }
  }, [
    requestsState.setAction,
    offersState.setAction,
    dispatch,
    shouldRedirectToFinished,
    shouldRedirectToArchived,
    history,
    isCav,
  ]);

  useEffect(() => {
    if (
      profileState.profile &&
      profileState.profile.applicationPreference &&
      profileState.userRef
    ) {
      if (
        accepted &&
        profileState.profile.applicationPreference === ApplicationPreference.cav
      ) {
        history.replace(TimelineViewLocation.toUrl({ requestRef }));
      } else {
        if (
          !requestsState.syncPostWithOffersAndTimelinesState.data &&
          !requestsState.syncPostWithOffersAndTimelinesState.loading
        ) {
          // TODO: (es) reimplement this
          // dispatch(
          //   getMyPinRequestPosts({
          //     userType: profileState.profile.applicationPreference,
          //     userRef: profileState.userRef,
          //     lat:
          //       profileState.privilegedInformation?.addresses?.default.coords
          //         .latitude,
          //     lng:
          //       profileState.privilegedInformation?.addresses?.default.coords
          //         .longitude,
          //   }),
          // );
        }
        if (
          !requestsState.syncPostWithOffersAndTimelinesState.data &&
          !requestsState.syncPostWithOffersAndTimelinesState.loading
        ) {
          dispatch(getPostWithOffersAndTimelineItems(requestRef));
        }
      }
    }
  }, [dispatch, profileState, history, requestRef, accepted, requestsState]);

  // TODO: (es) what? reimplement Figure out what this does
  // useEffect(() => {
    // if (
    //   profileState.profile &&
    //   profileState.profile.applicationPreference &&
    //   profileState.userRef
    // ) {
    //   if (request && request.status === RequestStatus.ongoing && accepted) {
    //     history.replace(TimelineViewLocation.toUrl({ requestId }));
    //   }
    //   if (request && request.offers) {
    //     let shouldRedirect = true;
    //     for (const k in request.offers) {
    //       if (request.offers[k].status === OfferStatus.pending) {
    //         shouldRedirect = false;
    //       }
    //     }
    //     if (shouldRedirect && accepted) {
    //       history.replace(TimelineViewLocation.toUrl({ requestId }));
    //     } else if (
    //       !shouldRedirect &&
    //       !accepted &&
    //       profileState.profile.applicationPreference ===
    //         ApplicationPreference.pin
    //     ) {
    //       history.replace(TimelineOfferPostViewLocation.toUrl({ requestId }));
    //     }
    //   }
    // }
  // }, [accepted, request, requestId, history, profileState, ]);

  if (!(profileState.profile && request)) {
    return <LoadingWrapper />;
  }

  const handleRequest = ({
    status,
    pinRating,
    cavRating,
  }: {
    status?: RequestStatus;
    pinRating?: number;
    cavRating?: number;
  }) => {
    if (request && (status || pinRating || cavRating)) {
      const updated = request.getRequest();
      status && (updated.status = status);
      pinRating &&
        (updated.pinRating = pinRating) &&
        (updated.pinRatedAt = firestore.Timestamp.now());
      cavRating &&
        (updated.cavRating = cavRating) &&
        (updated.cavRatedAt = firestore.Timestamp.now());
      if (updated.status === RequestStatus.ongoing && updated.pinRatedAt) {
        setShouldRedirectToFinished(true);
      }
      if (updated.status === RequestStatus.completed && updated.cavRatedAt) {
        setShouldRedirectToArchived(true);
      }
      dispatch(
        updateRequest(updated.toObject() as IRequest, requestId, phoneNumber),
      );
    }
  };

  const handleOffer = (action: boolean, id: string) => {
    const offer = request.offers[id].getOffer();
    if (action === true) {
      offer.status = OfferStatus.accepted;
    }
    if (action === false) {
      offer.status = OfferStatus.rejected;
    }
    offer.seenAt = null;
    dispatch(setOffer(offer.toObject() as IOffer, id, phoneNumber));
  };

  const instructions = [
    t('information_modal.TimelineViewContainer.0'),
    t('information_modal.TimelineViewContainer.1'),
    t('information_modal.TimelineViewContainer.2'),
    t('information_modal.TimelineViewContainer.3'),
    t('information_modal.TimelineViewContainer.4'),
    t('information_modal.TimelineViewContainer.5'),
    t('information_modal.TimelineViewContainer.6'),
  ];
  const instructionModalLocalStorageKey = makeLocalStorageKey({
    prefix: 'reach4help.modalSeen.TimelineViewContainer',
    userid: profileState.uid,
  });

  return (
    <>
      <TopPanel
        request={request}
        goBack={() => {
          dispatch(resetSetRequestState());
          setTimeout(() => {
            history.goBack();
          }, 100);
        }}
        user={
          profileState.profile.applicationPreference ===
          ApplicationPreference.cav
            ? request.pinUserSnapshot
            : request.cavUserSnapshot
            ? request.cavUserSnapshot
            : undefined
        }
      />
      {accepted && (
        <OffersList
          loading={false}
          destinationCoords={request.latLng}
          offers={request.offers}
          handleOffer={handleOffer}
        />
      )}
      {!accepted && request.timeline && profileState.userRef && (
        <>
          <TimelineList
            items={request.timeline}
            currentUser={profileState.userRef}
          />
        </>
      )}
      <div style={{ position: 'fixed', bottom: '0', width: '100%' }}>
        <BottomPanel
          request={request}
          currentUser={profileState.profile}
          handleRequest={handleRequest}
          isCav={isCav}
        />
      </div>
      <InformationModal
        title={t('information_modal.TimelineViewContainer.title')}
        localStorageKey={instructionModalLocalStorageKey}
        instructions={instructions}
      />
    </>
  );
};

export default TimelineViewContainer;
