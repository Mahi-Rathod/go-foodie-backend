--
-- PostgreSQL database dump
--

\restrict PtWL8nKkF08l6dcoAiO2wVW8iWDhpqc5JPWjjpJDMz6XJvYrX7Zwz9lE5Ggj12X

-- Dumped from database version 15.18 (Debian 15.18-1.pgdg13+1)
-- Dumped by pg_dump version 15.18 (Debian 15.18-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ADRESS_LABLE; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ADRESS_LABLE" AS ENUM (
    'HOME',
    'WORK',
    'OTHER'
);


ALTER TYPE public."ADRESS_LABLE" OWNER TO postgres;

--
-- Name: DOCUMENT_STATUS; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DOCUMENT_STATUS" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."DOCUMENT_STATUS" OWNER TO postgres;

--
-- Name: OTP_PURPOSE; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OTP_PURPOSE" AS ENUM (
    'REGISTER',
    'LOGIN',
    'RESET_PASSWORD',
    'DELETE_ACCOUNT'
);


ALTER TYPE public."OTP_PURPOSE" OWNER TO postgres;

--
-- Name: RESTAURANT_STATUS; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RESTAURANT_STATUS" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."RESTAURANT_STATUS" OWNER TO postgres;

--
-- Name: ROLE; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ROLE" AS ENUM (
    'USER',
    'ADMIN',
    'DELIVERY',
    'RESTAURANT'
);


ALTER TYPE public."ROLE" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Address" (
    id text NOT NULL,
    "userId" text NOT NULL,
    label public."ADRESS_LABLE" NOT NULL,
    "fullAddress" text NOT NULL,
    landmark text,
    city text NOT NULL,
    state text NOT NULL,
    "pinCode" text NOT NULL,
    country text NOT NULL,
    latitude double precision,
    longitude double precision,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Address" OWNER TO postgres;

--
-- Name: BankDetails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BankDetails" (
    id text NOT NULL,
    ifsc text NOT NULL,
    branch text NOT NULL,
    "restaurantId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "accountHolderName" text NOT NULL,
    "accountNumber" text NOT NULL,
    "bankName" text NOT NULL
);


ALTER TABLE public."BankDetails" OWNER TO postgres;

--
-- Name: Document; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Document" (
    id text NOT NULL,
    name text NOT NULL,
    status public."DOCUMENT_STATUS" DEFAULT 'PENDING'::public."DOCUMENT_STATUS" NOT NULL,
    note text,
    "restaurantId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "assetId" text NOT NULL,
    "documentType" text NOT NULL,
    "publicId" text NOT NULL,
    "resourceType" text NOT NULL,
    size double precision NOT NULL
);


ALTER TABLE public."Document" OWNER TO postgres;

--
-- Name: OtpCodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OtpCodes" (
    id text NOT NULL,
    identifier text NOT NULL,
    purpose public."OTP_PURPOSE" NOT NULL,
    otp_hash text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "userId" text
);


ALTER TABLE public."OtpCodes" OWNER TO postgres;

--
-- Name: Restaurant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Restaurant" (
    id text NOT NULL,
    name text NOT NULL,
    "ownerId" text NOT NULL,
    city text NOT NULL,
    "pinCode" text NOT NULL,
    latitude double precision,
    longitude double precision,
    "isOpen" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "fullAddress" text NOT NULL,
    status public."RESTAURANT_STATUS" DEFAULT 'PENDING'::public."RESTAURANT_STATUS" NOT NULL
);


ALTER TABLE public."Restaurant" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "tokenId" text NOT NULL,
    "userId" text NOT NULL,
    "refreshToken" text NOT NULL,
    "userAgent" text,
    "ipAddress" text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    username text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    mobile text NOT NULL,
    password text NOT NULL,
    role public."ROLE" DEFAULT 'USER'::public."ROLE" NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- Name: BankDetails BankDetails_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BankDetails"
    ADD CONSTRAINT "BankDetails_pkey" PRIMARY KEY (id);


--
-- Name: Document Document_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_pkey" PRIMARY KEY (id);


--
-- Name: OtpCodes OtpCodes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OtpCodes"
    ADD CONSTRAINT "OtpCodes_pkey" PRIMARY KEY (id);


--
-- Name: Restaurant Restaurant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Restaurant"
    ADD CONSTRAINT "Restaurant_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: BankDetails_restaurantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "BankDetails_restaurantId_key" ON public."BankDetails" USING btree ("restaurantId");


--
-- Name: OtpCodes_identifier_purpose_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OtpCodes_identifier_purpose_idx" ON public."OtpCodes" USING btree (identifier, purpose);


--
-- Name: Session_refreshToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_refreshToken_key" ON public."Session" USING btree ("refreshToken");


--
-- Name: Session_tokenId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_tokenId_key" ON public."Session" USING btree ("tokenId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_mobile_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_mobile_key" ON public."User" USING btree (mobile);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BankDetails BankDetails_restaurantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BankDetails"
    ADD CONSTRAINT "BankDetails_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES public."Restaurant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Document Document_restaurantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES public."Restaurant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OtpCodes OtpCodes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OtpCodes"
    ADD CONSTRAINT "OtpCodes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Restaurant Restaurant_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Restaurant"
    ADD CONSTRAINT "Restaurant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict PtWL8nKkF08l6dcoAiO2wVW8iWDhpqc5JPWjjpJDMz6XJvYrX7Zwz9lE5Ggj12X

